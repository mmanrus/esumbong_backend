import * as concernService from "../../services/concern.service.js";

export const getConcernById = async (req, res) => {
     const {concernId }= req.body
     try {
          const concern = await concernService.getConcernById(concernId)
          if (!concern) {
               return res.status(404).data()
          }
     } catch (error) {
          console.error("Error getting concern")
     }
};
