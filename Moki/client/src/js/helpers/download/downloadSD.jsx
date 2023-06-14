import querySrv from '../querySrv';
const BASE_NAME = import.meta.env.BASE_URL;

export async function downloadSD(pathname) {
    if(! Array.isArray(pathname)){
        pathname = [pathname];
    }
    try {
        console.log(BASE_NAME + "api/diagram");
        const response = await querySrv(BASE_NAME + "api/diagram/download", {
            method: "POST",
            credentials: 'include',
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Credentials": "include"
            },
            body: JSON.stringify({
                url: pathname
            })
        });
        const sd = await response.text();
        return sd;
    } catch (error) {
        console.error(error);
        alert("Problem with receiving alarms data. " + error);
    }
}
