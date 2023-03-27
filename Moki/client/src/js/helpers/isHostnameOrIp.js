
function hostnameRegex(){
    const alpha = "[a-zA-Z]";
    const alphadigit = "[a-zA-Z0-9]";

    // domainlabel  = alphadigit | alphadigit *[ alphadigit | "-" ] alphadigit
    const domainlabel = `(${alphadigit}|(${alphadigit}(${alphadigit}|-)*${alphadigit}))`;

    // toplabel     = alpha | alpha *[ alphadigit | "-" ] alphadigit
    const toplabel = `(${alpha}|(${alpha}(${alphadigit}|-)*${alphadigit}))`

    // hostname     = *[ domainlabel "." ] toplabel
    const hostname = `(${domainlabel}\\.)*${toplabel}`;

    return hostname;
}

function ipv4Regex(){
    const octet99 = "([1-9]?[0-9])";               // match 0-99 leading zeros not allowed
    const octet199 = "(1[0-9][0-9])";              // match 100-199
    const octet255 = "(2(([0-4][0-9])|5[0-5]))";   // match 200-255

    const ipv4octet = `(${octet99}|${octet199}|${octet255})`;
    const ipv4address = `(${ipv4octet}\\.${ipv4octet}\\.${ipv4octet}\\.${ipv4octet})`;

    return ipv4address;
}

function ipv6Regex(){
    const hex4 = "([0-9a-fA-F]{1,4})";
    const hexseq = "(" + hex4 + "(:" + hex4 + ")*)";
    const hexpart = "(" + hexseq + "|(" + hexseq + "::" + hexseq + "?)|(::" + hexseq + "?))";

    const ipv4address = ipv4Regex();

    const ipv6address = "(" + hexpart + "(:" + ipv4address + ")?)";

    return ipv6address;
}

export function isHostname(value){
    if (value !== "") {
        var re =   new RegExp(`^${hostnameRegex()}$`);
        return re.test(value);
    }
    return true;
}

export function isHostnameOrIp(value) {


    /**
        * Return regexp matching host part of an URL
        *
        * @return string
        */
    function host() {

        let hostname = hostnameRegex();
        let ipv4address = ipv4Regex();
        let ipv6address = ipv6Regex();
        let ipv6reference = "(\\[" + ipv6address + "])";

        // host         = hostname | ipv4address | ipv6reference
        let host = `(${hostname}|${ipv4address}|${ipv6reference})`;

        return host;
    }

    if (value !== "") {
        var re =   new RegExp(`^${host()}$`);
        return re.test(value);
    }
    return true;
}

