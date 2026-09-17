/**
 * The counterpart probe: nothing in its command line matches the sweep's
 * allowlist, so it stands in for a developer's own server that happens to be
 * on one of our ports. The sweep must refuse it and leave it running.
 */
import { createServer } from 'node:net';

const port = Number(process.argv[2]);
createServer(socket => socket.destroy()).listen(port, '127.0.0.1');
setInterval(() => {}, 60_000);
