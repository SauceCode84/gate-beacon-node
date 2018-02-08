const bleno = require("./node_modules/eddystone-beacon/node_modules/bleno");
const beacon = require("eddystone-beacon");

let desc = new bleno.Descriptor({
  uuid: "2901",
  value: "Description"
});

let char = new bleno.Characteristic({
  uuid: "e0d38f1c56ca4b759d443e4134f7cb0b",
  properties: ["read"],
  value: new Buffer("example"),
  descriptors: [ desc ]
});

let service = new bleno.PrimaryService({
  uuid: "e0d38f1c56ca4b759d443e4134f7cb0a",
  characteristics: [ char ]
});

bleno.on("stateChange", function (state) {
  console.log("on -> stateChange: " + state);
});

bleno.once("advertisingStart", function (err) {
  if (err) {
    throw err;
  }

  console.log("on -> advertisingStart");

  bleno.setServices([ service ]);
});

beacon.advertiseUrl("https://goo.gl/pheJrb", { name: "Visitors Gate" });
