const dns = require('dns');
const url = require('url');
require('dotenv').config();

const uri = process.env.MONGO_URI;
// Extract hostname
// mongodb+srv://user:pass@HOSTNAME/...
const hostname = uri.split('@')[1].split('/')[0];

console.log("Looking up hostname:", hostname);

dns.lookup(hostname, (err, address, family) => {
    if (err) {
        console.error("DNS Lookup Failed:", err.code);
        process.exit(1);
    }
    console.log('Address: %j family: IPv%s', address, family);
    process.exit(0);
});
