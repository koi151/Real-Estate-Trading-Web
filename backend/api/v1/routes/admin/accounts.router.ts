import { Router } from "express";
import multer from "multer";

const router: Router = Router();

import * as controller from '../../controllers/admin/accounts.controller';
// import * as validate from '../../validates/admin/property.validate';
import * as uploadCloud from '../../../../middlewares/admin/uploadCloud.middleware'

const upload = multer();

router.get('/', controller.index);
router.get('/detail/:accountId', controller.detail)
router.get('/avatar/:accountId', controller.getAvatar)

router.post(
  '/create',
  upload.single('avatar'),
  // validate.createProperty,
  uploadCloud.uploadSingle,
  controller.createPost
);

router.patch(
  '/edit/:accountId', 
  upload.single('avatar'),
  // validate.createProperty,
  uploadCloud.uploadSingle,
  controller.editPatch
);

router.patch('/change-status/:status/:accountId', controller.changeStatus);
// router.patch('/multi-change', controller.multiChange);

router.delete('/delete/:accountId', controller.singleDelete);

export const accountsRoutes: Router = router;