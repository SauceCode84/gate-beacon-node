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

let validateChar = new bleno.Characteristic({
  uuid: "e0d38f1c56ca4b759d443e4134f7cb0c",
  properties: ["read", "write"],
  value: null,
  onWriteRequest: function(data, offset, withoutResponse, callback) {
    console.log("validateChar.onWriteRequest");
    console.log("data", data);

    if (offset) {
      callback(this.RESULT_ATTR_NOT_LONG);
    } else if (data.length !== 1) {
      callback(this.RESULT_INVALID_ATTRIBUTE_LENGTH);
    } else {
      this.value = data.readUInt8(0);
      callback(this.RESULT_SUCCESS);
    }
  }
  /*onReadRequest: function(offset, callback) {
    if
  }*/
});

let service = new bleno.PrimaryService({
  uuid: "e0d38f1c56ca4b759d443e4134f7cb0a",
  characteristics: [ char, validateChar ]
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
