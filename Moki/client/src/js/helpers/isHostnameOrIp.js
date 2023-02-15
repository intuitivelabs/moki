


export default function isHostnameOrIp(value) {


    /**
        * Return regexp matching host part of an URL
        *
        * @return string
        */
    function host() {

        let alpha = "[a-zA-Z]";
        let alphadigit = "[a-zA-Z0-9]";

        // domainlabel  = alphadigit | alphadigit *[ alphadigit | "-" ] alphadigit
        let domainlabel = `(${alphadigit}|(${alphadigit}(${alphadigit}|-)*${alphadigit}))`;

        // toplabel     = alpha | alpha *[ alphadigit | "-" ] alphadigit
        let toplabel = `(${alpha}|(${alpha}(${alphadigit}|-)*${alphadigit}))`

        // hostname     = *[ domainlabel "." ] toplabel
        let hostname = `(${domainlabel}\\.)*${toplabel}`;

        let hex4 = "([0-9a-fA-F]{1,4})";
        let hexseq = "(" + hex4 + "(:" + hex4 + ")*)";
        let hexpart = "(" + hexseq + "|(" + hexseq + "::" + hexseq + "?)|(::" + hexseq + "?))";

        let octet99 = "([1-9]?[0-9])";               // match 0-99 leading zeros not allowed
        let octet199 = "(1[0-9][0-9])";              // match 100-199
        let octet255 = "(2(([0-4][0-9])|5[0-5]))";   // match 200-255

        let ipv4octet = `(${octet99}|${octet199}|${octet255})`;
        let ipv4address = `(${ipv4octet}\\.${ipv4octet}\\.${ipv4octet}\\.${ipv4octet})`;

        let ipv6address = "(" + hexpart + "(:" + ipv4address + ")?)";
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

