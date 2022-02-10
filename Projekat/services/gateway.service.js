"use strict";
const express = require("express");
const bodyParser = require('body-parser');
const socket = require("socket.io");
const cors = require("cors");

module.exports = {
    name: "gateway",
    settings: {
        port: process.env.PORT || 3000,
        cors: {
            // Configures the Access-Control-Allow-Origin CORS header.
            origin: "*",
            // Configures the Access-Control-Allow-Methods CORS header.
            methods: ["GET", "OPTIONS", "POST", "PUT", "DELETE"],
            // Configures the Access-Control-Allow-Headers CORS header.
            allowedHeaders: [],
            // Configures the Access-Control-Expose-Headers CORS header.
            exposedHeaders: [],
            // Configures the Access-Control-Allow-Credentials CORS header.
            credentials: false,
            // Configures the Access-Control-Max-Age CORS header.
            maxAge: 3600
        }
    },
    events:{
        "warning"(message) {
            this.io.emit('Notification', { info: message });
        }
    },
    methods: {
        initRoutes(app) {
            app.put("/beachinfo", this.getData);
            app.put("/sensorinfo", this.getSensorData);
            app.put("/setsensor", this.putData);
            app.post("/CEP", this.cepService);
        },
        getData(req, res) {
            
            return Promise.resolve()
                .then(() => {
                    return this.broker.call("data.getData", { "name": req.body.BeachName, "temp": req.body.WaterTemperature,"wavePeriod": req.body.WavePeriod,"bat": req.body.BatteryLife}).then(temps => {
                        res.send(temps);
                    });
                })
                .catch(this.handleErr(res));
        },getSensorData(req,res){
            
            return Promise.resolve()
                .then(() => {
                    return this.broker.call("command.getSensorData", { id: req.body.id }).then(temps => {
                        res.send(temps);
                    });
                })
                .catch(this.handleErr(res));
        },
        putData(req, res) {

            return Promise.resolve()
            .then(() => {
                return this.broker.call("command.setSensorInterval", { id: req.body.id, interval: req.body.interval }).then(temps => {
                    res.send(temps);
                });
            })
            .catch(this.handleErr(res));

        },cepService(req,res){

            return Promise.resolve()
            .then(() => {
                return this.broker.call("analytics.CEPWarning", { message: req.body }).then(temps => {
                    res.send(temps);
                });
            })
            .catch(this.handleErr(res));
            
        },
        handleErr(res) {
            return err => {
                res.status(err.code || 500).send(err.message);
            };
        }
    },
    created() {
        const app = express();
        app.use(bodyParser.urlencoded({ extended: false }));
        app.use(bodyParser.json());
        app.use(cors());
        this.initRoutes(app);
        this.app = app; 

        const httpServer = require("http").createServer(app);
        this.server=httpServer;
        httpServer.listen(this.settings.port);  
    },
    started(){
        this.io = socket(this.server, {
            cors: {
                origin: "*",
                methods: ["GET", "POST"]
            }
        });

        this.io.on("connection", client => {
            console.log("Client successfully connected!");

            client.on("disconnect", () => {
                console.log("Client disconnected.");
            });

        });
    }
};