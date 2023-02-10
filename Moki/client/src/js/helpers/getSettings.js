import querySrv from './querySrv';

//get monitor settings from defaults.json or stored user values

export async function getSettings() {
    var url = process.env.PUBLIC_URL+"/api/setting";
    try {
        const response = await querySrv(url, {
            method: "GET",
            credentials: 'include',
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Credentials": "include"
            }
        });
        return await response.json();
    } catch (error) {
        console.error(error);
        return error;
    }
}