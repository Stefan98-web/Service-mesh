"use strict";

const DbService = require("../mixins/db.mixin");
const mqtt=require('mqtt');
const { ServiceBroker } = require("moleculer");
const Influx = require('influx');
var client = null;
const broker = new ServiceBroker();
var influx = null;
module.exports = {
	name: "data",
	mixins: [
		DbService("beach-water-quality")
	],
	settings: {
       /* fields:["_id","Beach Name","Measurement timestamp","Water temperature",
    "Turbidity","Transducer depth","Wave height","Wave Period","Battery life",
    "Measurement timestamp label","Measurement ID"]*/
	},
	actions: {
		/**
		 * Add a new row.
		 *
		 * @actions
		 * @param {Object} data - Data entity
		 *
		 * @returns {Object} Created entity
		 */
		postData:{
			rest: {
				method: "POST",
				path: "/Data",
			},
			params: {
				data: { type: "object" }
			},
			async handler(ctx){
				
            var currentdate = new Date();
			/*this.influx.writePoints([
                    {
                        measurement: 'sensorDataIOT',
                        fields: {
							temperature: 1,
							sensorId: 1
                        },
                        time: Date.now() 
                    }
				]);*/

			this.influx.query(`select * from sensorDataIOT`)
  				.then( result => console.log(JSON.stringify(result)) )
  					.catch( error =>  console.log( error ) );

                let entity = ctx.params.data;
				const doc = await this.adapter.insert(entity);
				let info = { "entity":entity };

				if (client.connected==true)
				{
					client.publish("Analytics", JSON.stringify(info));
				}
				else
				{
					console.log("Data klijent nije povezan na MQTT");
				}

				return doc;
			}
		},

		getData:{
			rest:{
				method: "GET",
				path: "/Data"
			},set: {
				 params:{
				 	name: {type: "String"},
				 	temp: {type: "String"},
				 	wavePeriod: {type: "String"},
					bat: {type: "String"}
				 }
			},
			async handler(ctx){

				let params = {
					limit:10,
					sort: ["Beach Name", "Water Temperature", "Battery Life"],
					query: {}
					 };
				if(ctx.params.name!="All"){
						params.query["Beach Name"]=ctx.params.name.toString();
					}
				if(ctx.params.temp!="All"){
					   params.query["Water Temperature"]=ctx.params.temp.toString();
				   }
				if(ctx.params.bat!="All"){
					   params.query["Battery Life"]=ctx.params.bat.toString();
				   }
				if(ctx.params.wavePeriod!="All"){
					params.query["Wave Period"]=ctx.params.wavePeriod.toString();
				}

				const result = await this.adapter.find(params);
				return result;
			}
		},	
	},
	/**
	 * Events
	 */
	 events: {
	},
	/**
	 * Service created lifecycle event handler
	 */
	created() {
		client = mqtt.connect("mqtt://mqtt:1883",{clientId:"mqttjs02"});
        client.on("connect",function() { console.log("Data connected to MQTT") });

		this.influx = new Influx.InfluxDB({
			host: process.env.INFLUXDB_HOST || 'influx',
			database: process.env.INFLUXDB_DATABASE || 'sensorDataIOT',
			port: 8086,
			username: process.env.ADMIN_USER || 'admin',
			password: process.env.ADMIN_PASSWORD || 'admin',
			schema: [
				{
					measurement: 'sensorDataIOT',
					fields: {
						sensorId: Influx.FieldType.INTEGER,
						temperature: Influx.FieldType.INTEGER,
					},
					tags: ['host'],
				}
			]
		});
		
		this.influx.getDatabaseNames().then((names) => {
			console.log(names)
			if (!names.includes('sensorDataIOT')) {
			  return this.influx.createDatabase('sensorDataIOT');
			}
			return null;
		}).catch( error => console.log(error));
	},

	/**
	 * Service started lifecycle event handler
	 */
	async started() {
	},

	/**
	 * Service stopped lifecycle event handler
	 */
	async stopped() {
		client.end();
	},
};