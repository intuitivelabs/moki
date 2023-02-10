export default async function querySrv(resource, options) {

    // Add 'X-Requested-With' http header so server can easily detect
    // these requests
    if (!options) options = {};
    if (!options.headers) options.headers = {};
    options.headers['X-Requested-With'] = 'XMLHttpRequest';

    const response = await fetch(resource, options);

    if (response.headers.has('X-client-redirect')){
        window.location.href = response.headers.get("X-client-redirect");
    }

    return response;
}
