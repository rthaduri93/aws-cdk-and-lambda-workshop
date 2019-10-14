"use strict";
window.order = window.order || {};
(function (namespace) {

    const ORDERS_ENDPOINT_URL = "https://TODO.insert.here.the.AWS.API.Gateway/endpoint";

    function initCreateOrderPage() {
        initForm(clearResponsePayloadOutlet, showPayload);
    }

    function initViewOrderPage() {
        initForm(clearResponsePayloadOutlet, showPayload);
    }

    function initEditOrderPage() {
        initForm(clearResponsePayloadOutlet, showPayload);
    }

    function clearResponsePayloadOutlet() {
        $("#responsePayload").text("");
    }

    function showPayload(data) {
        const response = JSON.stringify(data, undefined, 2);
        console.log("data: ", response);
        $("#responsePayload").text(response);
    }

    function initForm(beforeRequest, onSuccessfulSubmit) {
        const form = $("form");
        const submitBtn = form.find("button[type='submit']");
        submitBtn.click(function (event) {
            event.preventDefault();
            const payload = JSON.stringify(form.serializeArray());
            beforeRequest();
            $.ajax({
                type: "POST",
                url: ORDERS_ENDPOINT_URL,
                data: payload,
                contentType: "application/json",
                dataType: "json",
                success: onSuccessfulSubmit,
                error: function onError(jqXHR, status, error) {
                    console.log("AJAX error, status = \"" + status + "\", error = \"" + error + "\"");
                }
            });
        });
    }
    // exports
    namespace.initCreateOrderPage = initCreateOrderPage;
    namespace.initViewOrderPage = initViewOrderPage;
    namespace.initEditOrderPage = initEditOrderPage;
})(window.order);
