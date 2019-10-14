import DynamoDB from "aws-sdk/clients/dynamodb";



interface FormParameter {
  name: string;
  value: string;
}

type FormData = Map<string, string>;

interface HttpResponse {
  statusCode: number;
  headers?: { [key: string]: string };
  body?: string;
}

interface Order {
  orderId: string;
  name: string;
  description: string;
  status: OrderStatus;
}

enum OrderStatus {
  CREATED = "CREATED",
  IN_PROCESSING = "IN_PROCESSING",
  IN_DELIVERY = "IN_DELIVERY",
  DELIVERED = "DELIVERED",
}



const CORS_HEADERS = {
  "Access-Control-Allow-Headers": "*",
  "Access-Control-Allow-Methods": "*",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Max-Age": "86400"
};
const FORM_PARAMETER_ACTION_TYPE = "actionType";
const FORM_PARAMETER_ORDER_ID = "orderId";
const FORM_PARAMETER_ITEM_NAME = "itemName";
const FORM_PARAMETER_ITEM_DESCIPTION = "itemDescription";
const FORM_PARAMETER_ORDER_STATUS = "orderStatus";



async function handler(event: any = {}): Promise<HttpResponse> {
  console.log("received event: ", JSON.stringify(event));
  if (isCorsPreflightRequest(event)) {
    return allowCors();
  }
  if (!event.body) {
    console.error("no payload is provided");
    return badRequest();
  }
  const formData = getFormData(event);
  if (isCreateAction(formData)) {
    return createItem(formData);
  } else if (isViewAction(formData)) {
    return viewItem(formData);
  } else if (isEditAction(formData)) {
    return editItem(formData);
  }
  console.error("unknown action");
  return badRequest();
};



function isCorsPreflightRequest(event: any): boolean {
  return "OPTIONS" === event.httpMethod;
}



//#region parsing form data
function getFormData(event: any): FormData {
  const serializedFormData = JSON.parse(getRawPayload(event)) as Array<FormParameter>;
  const formData = new Map<string, string>();
  serializedFormData.forEach(p => formData.set(p.name, p.value));
  return formData;
}

function getRawPayload(event: any): string {
  const body = event.body as string;
  if (!event.isBase64Encoded) {
    return body;
  }
  const buffer = Buffer.from(body, "base64");
  return buffer.toString("utf8");
}
//#endregion



//#region create
function isCreateAction(formData: FormData): boolean {
  return "CREATE" === formData.get(FORM_PARAMETER_ACTION_TYPE);
}

async function createItem(formData: FormData): Promise<HttpResponse> {
  const order = {
    orderId: generateOrderId(),
    name: formData.get(FORM_PARAMETER_ITEM_NAME)!,
    description: formData.get(FORM_PARAMETER_ITEM_DESCIPTION)!,
    status: OrderStatus.CREATED,
  };
  await createOrReplaceOrder(order);
  return ok({ order });
}

function generateOrderId(): string {
  const date = new Date();
  const random = Math.floor(1000 * Math.random()) | 0;
  return date.toISOString() + "-" + random;
}
//#endregion



//#region view
function isViewAction(formData: FormData): boolean {
  return "VIEW" === formData.get(FORM_PARAMETER_ACTION_TYPE);
}

async function viewItem(formData: FormData): Promise<HttpResponse> {
  const orderId = formData.get(FORM_PARAMETER_ORDER_ID);
  const dynamoDbClient = new DynamoDB();
  const dbResponse = await dynamoDbClient.getItem({
    TableName: getDynamoDbTableName(),
    Key: {
      "OrderId": {
        S: orderId
      }
    },
  }).promise();
  if (!dbResponse.Item) {
    return notFound();
  }
  return ok(toOrder(dbResponse.Item!));
}
//#endregion



//#region edit
function isEditAction(formData: FormData): boolean {
  return "EDIT" === formData.get(FORM_PARAMETER_ACTION_TYPE);
}

async function editItem(formData: FormData): Promise<HttpResponse> {
  const order = {
    orderId: formData.get(FORM_PARAMETER_ORDER_ID)!,
    name: formData.get(FORM_PARAMETER_ITEM_NAME)!,
    description: formData.get(FORM_PARAMETER_ITEM_DESCIPTION)!,
    status: formData.get(FORM_PARAMETER_ORDER_STATUS) as OrderStatus,
  };
  await createOrReplaceOrder(order);
  return ok(order);
}
//#endregion



//#region DynamoDB persistance
async function createOrReplaceOrder(order: Order): Promise<any> {
  const newItem: DynamoDB.Types.PutItemInput = {
    TableName: getDynamoDbTableName(),
    Item: toDynamoDbItem(order),
  };
  const dynamoDbClient = new DynamoDB();
  await dynamoDbClient.putItem(newItem).promise();
}

function getDynamoDbTableName(): string {
  return process.env.TABLE_NAME as string;
}

function toDynamoDbItem(order: Order): DynamoDB.AttributeMap {
  return {
    "OrderId": {
      S: order.orderId
    },
    "Name": {
      S: order.name
    },
    "Description": {
      S: order.description
    },
    "Status": {
      S: order.status
    }
  };
}

function toOrder(dbItem: DynamoDB.AttributeMap): Order {
  return {
    orderId: dbItem["OrderId"].S!,
    name: dbItem["Name"].S!,
    description: dbItem["Description"].S!,
    status: dbItem["Status"].S as OrderStatus,
  };
}
//#endregion



//#region HTTP response helper methods
function allowCors(): HttpResponse {
  return {
    statusCode: 200,
    headers: CORS_HEADERS
  };
}

function badRequest(): HttpResponse {
  return { statusCode: 400 };
}

function notFound(): HttpResponse {
  return { statusCode: 404 };
}

function ok(payload: any): HttpResponse {
  return {
    statusCode: 200,
    headers: {
      ...CORS_HEADERS,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload)
  };
}
//#endregion



export { handler };
