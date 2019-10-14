// see https://scotch.io/@nwayve/how-to-build-a-lambda-function-in-typescript#toc-lambda-entrypoint

async function handler(event: any = {}): Promise<any> {
  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(event)
  };
};

export { handler };
