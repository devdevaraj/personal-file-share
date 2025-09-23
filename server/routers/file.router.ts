import { Router } from "express";
import * as fileController from "../controllers/file.controller";
import requireAuth from "../middlewares/user.auth";
import multer from "multer";
import { UPLOAD_DIR } from "..";

const fileRouter = Router();

const storage = multer.diskStorage({
 destination: (req, file, cb) => cb(null, UPLOAD_DIR),
 filename: (req, file, cb) => {
  const safeName = file.originalname.replace(/\s+/g, '_');
  const timestamp = Date.now();
  cb(null, `${timestamp}_${safeName}`);
 }
});
const upload = multer({ storage });

fileRouter.post("/upload", requireAuth, upload.array('files'), fileController.upload);
fileRouter.get("/list", requireAuth, fileController.list);
fileRouter.delete("/delete/:filename", requireAuth, fileController.del);

export default fileRouter;