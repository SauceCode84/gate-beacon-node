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
  onWriteRequest: function(data, offset, withoutResponse, callback) {
    console.log("validateChar.onWriteRequest");
    console.log("data", data);

    if (offset) {
      callback(this.RESULT_ATTR_NOT_LONG);
    } else if (data.length !== 8) {
      callback(this.RESULT_INVALID_ATTRIBUTE_LENGTH);
    } else {
      this.userId = data;
      console.log("data.toString()", data.toString());

      let result = data.toString() === "012ebc6d";
      
      fetch("https://us-central1-kompleks-dev.cloudfunctions.net/verifyId", {
        method: "POST",
        body: { data: data.toString() }
      })
      .then(res => {
        if (res.status === 200) {
          return res.json();
        } else {
          throw new Error("Oh crap!");
        }
      })
      .then(json => {
        console.log(json);

        if (updateWriteAccess) {
          updateWriteAccess(json.result);
        }

        callback(this.RESULT_SUCCESS);
      })
      .catch(err => {
        console.error(err);

        if (updateWriteAccess) {
          updateWriteAccess(false);
        }

        callback(this.RESULT_SUCCESS);
      });
    }
  },
  onReadRequest: function(offset, callback) {
    console.log("validateChar.onReadRequest");

    if (offset) {
      callback(this.RESULT_ATTR_NOT_LONG, null);
    } else {
      let data = this.userId;

      if (!data || !data.length) {
        data = new Buffer("");
      }
      
      console.log("data", data);
      callback(this.RESULT_SUCCESS, data);
    }
  }
});

const accessCallback = (callback) => (value) => {
  if (callback) {
    console.log(`callback(${value})`);
    
    let data = new Buffer(1);
    data.writeUInt8(value ? 0x01 : 0x00);

    callback(data);
  }
}

let updateWriteAccess;

let accessChar = new bleno.Characteristic({
  uuid: "e0d38f1c56ca4b759d443e4134f7cb0d",
  properties: ["notify"],
  onSubscribe: function(maxValueSize, updateValueCallback) {
    updateWriteAccess = accessCallback(updateValueCallback);
  }
});

let service = new bleno.PrimaryService({
  uuid: "e0d38f1c56ca4b759d443e4134f7cb0a",
  characteristics: [ char, validateChar, accessChar ]
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
