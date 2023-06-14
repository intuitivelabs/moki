/*
Scroll query if data to retrieve are more than 10000
used for table charts
*/
var scroll = async function (client, scroll_id) {
    var response = await client.scroll({
        scroll: '20s',
        scroll_id: scroll_id
    });
    return response;
}


export default {
    scroll: scroll
};
