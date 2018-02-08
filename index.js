const bleno = require("./node_modules/bleno");
const beacon = require("eddystone-beacon");

let char = new bleno.Characteristic({
  uuid: "E0D38F1C-56CA-4B75-9D44-3E4134F7CB0B",
  properties: ["read"],
  value: new Buffer("example")
});

let service = new bleno.PrimaryService({
  uuid: "E0D38F1C-56CA-4B75-9D44-3E4134F7CB0A",
  characteristics: [ char ]
});

bleno.once("advertisingStart", function (err) {
  if (err) {
    throw err;
  }

  console.log("on -> advertisingStart");

  bleno.setServices([ service ]);
});

beacon.advertiseUrl("https://goo.gl/pheJrb", { name: "Visitors Gate" });
