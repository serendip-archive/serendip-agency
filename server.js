() => {
  return class server {
    constructor(modules) {
      this.modules = modules;
    }

    async start() {
      //   this.modules.SBC.AuthService.configure({
      //     username: process.env["sbc.username"],
      //     password: process.env["sbc.password"]
      //   });
      //   this.modules.SBC.DataService.configure({
      //     business: process.env["sbc.business"]
      //   });
      //   this.modules.SBC.DbService.options = {
      //     defaultProvider: "Mongodb",
      //     providers: {
      //       Mongodb: {
      //         object: new this.modules.SMP.MongodbProvider(),
      //         options: {
      //           mongoDb: process.env["db.mongoDb"],
      //           mongoUrl: process.env["db.mongoUrl"],
      //           authSource: process.env["db.authSource"],
      //           user: process.env["db.user"],
      //           password: process.env["db.password"]
      //         }
      //       }
      //     }
      //   };
      //   if (
      //     this.modules.SBC.AuthService.options.username &&
      //     this.modules.SBC.AuthService.options.password
      //   )
      //     try {
      //       await this.modules.SBC.Client.bootstrap({
      //         services: [
      //           this.modules.SBC.DataService,
      //           this.modules.SBC.DbService,
      //           this.modules.SBC.BusinessService,
      //           this.modules.SBC.AuthService,
      //           this.modules.SBC.HttpClientService,
      //           this.modules.SBC.LocalStorageService
      //         ],
      //         logging: "info"
      //       });
      //       this.modules.sbc = {
      //         data: this.modules.SBC.Client.services["DataService"]
      //       };
      //     } catch (error) {
      //       console.log(error);
      //     }
      //   await this.modules.sbc.data.sync()
    }
  };
};
