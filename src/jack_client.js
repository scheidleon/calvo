/**
 * Query JACK info and status. uses https://github.com/ajboni/jack-audio-tools
 * @module jack_client
 */

let store = require("./store");
const Layout = require("./layout");
const PubSub = require("pubsub-js");

let jack;

PubSub.subscribe("jack", function (jackStatus) {
  jack = jackStatus;
});

/**
 * Initialize. Set up polling.
 *
 */
function init() {
  //   queryJack();
  updateStatus();
  poll();
}

/**
 * Poll JACK for info.
 * @see settings
 */
function poll() {
  if (store.getJackStatus().JACK_STATUS.status === "running") {
    updateStatus();
  } else {
    throw "JACK IS NOT RUNNING";
  }
}

function updateStatus() {
  store.setJackStatus(queryJack(), queryTransport(), getAvailableJackPorts());
}

/**
 * Get several Jack Statuses.
 * @returns Returns a json object with each property: status, cpu_load, block_size, realtime, sample_rate
 */
function queryJack() {
  const cp = require("child_process");
  const status = cp.execSync(
    "python3 ./py/jack-audio-tools/jack/client.py -c calvo-poll query",
    { encoding: "utf8" }
  );
  return JSON.parse(status);
}

/**
 * Queries JACK transport to get status.
 *
 * @returns Returns a JSON object with the JACK transport status.
 */
function queryTransport() {
  const cp = require("child_process");
  const status = cp.execSync(
    `python3 ./py/jack-audio-tools/jack/transporter.py -c calvo-poll query`,
    { encoding: "utf8" }
  );
  return JSON.parse(status);
}

function setTransportStatus(status) {
  //       choices=['query', 'rewind', 'start', 'status', 'stop', 'toggle'],
}

/**
 * Get all available JACK audio/midi input/output ports.
 *
 * @returns Returns a JSON object with all available ports.
 */
function getAvailableJackPorts() {
  const cp = require("child_process");
  const info = cp.execSync(
    `python3 ./py/jack-audio-tools/jack/client.py -c calvo-poll port-info`,
    { encoding: "utf8" }
  );
  return JSON.parse(info);
}
exports.init = init;
exports.poll = poll;
exports.queryTransport = queryTransport;
