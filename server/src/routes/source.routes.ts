import { Router } from "express";
import multer from "multer";
import { asyncHandler } from "../utils/async-handler.js";
import {
    bulkDeleteSources,
    createSource,
    deleteSource,
    getSource,
    importWebsite,
    importYoutube,
    listSources,
    uploadPdf,
    
} from "../controllers/source.controller.js";


export const sourceRoutes = Router({ mergeParams: true });
const uploadPdfFile = multer({
    storage: multer.memoryStorage(),
    fileFilter: (_req, file, callback) => {
        if (file.mimetype !== "application/pdf") {
            callback(new Error("Only PDF files are allowed"));
            return;
        }

        callback(null, true);
    },
    limits: {
        fileSize: 25 * 1024 * 1024,
    },
});

sourceRoutes.get("/", asyncHandler(listSources));
sourceRoutes.post("/", asyncHandler(createSource));
sourceRoutes.post("/bulk-delete", asyncHandler(bulkDeleteSources));
sourceRoutes.get("/:sourceId", asyncHandler(getSource));
sourceRoutes.delete("/:sourceId", asyncHandler(deleteSource));
sourceRoutes.post(
    "/upload-pdf",
    uploadPdfFile.single("file"),
    asyncHandler(uploadPdf),
);
sourceRoutes.post("/import-website", asyncHandler(importWebsite));
sourceRoutes.post("/import-youtube", asyncHandler(importYoutube));