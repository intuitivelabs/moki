import querySrv from '../querySrv';
const BASE_NAME = import.meta.env.BASE_URL;

export async function downloadPcapMerged(pathname) {
    let response;
    console.info("Downloading pcap " + pathname);
    try {
        response = await querySrv(BASE_NAME + "api/download/pcap", {
            method: "POST",
            timeout: 10000,
            credentials: 'include',
            body: JSON.stringify({
                urls: pathname
            }),
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Credentials": "include"
            }
        })
    } catch (error) {
        return "ERROR: " + error;
    }

    if (!response.ok) {
        // response
        return "ERROR: File not found. You can extend storage in settings page.";
    }

    if(response.status !== 200){
        return "ERROR: Problem with getting file.";
    }
    return await response.blob();
}
