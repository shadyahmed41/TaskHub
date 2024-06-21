const express = require("express");
const bodyParser = require("body-parser");
const postcontroller = require("../controllers/postcontoller");
const multer = require("multer");
const authenticateUserToken = require("../token/authenticateuser");

const router = express.Router(); // Create a Router instance
const upload = multer();

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

router.post("/create-post", upload.single("file"), authenticateUserToken, postcontroller.createpost);//
router.get("/posts/:projectid", authenticateUserToken, postcontroller.viewposts);//
router.delete("/delete-post/:postId", authenticateUserToken, postcontroller.deletepost);//
router.post("/like/:postId",  postcontroller.likepost);//
router.delete("/like/:postId", postcontroller.unlikepost);//
router.post("/comment/:postId", postcontroller.addcomment);//
router.get("/post/:postId/comments/:userId", postcontroller.getPostComments);//
router.delete("/comment/:postId/:commentId", postcontroller.deletecomment);//
router.post("/like-comment/:postId/:commentId", postcontroller.likecomment);//
router.delete("/like-comment/:postId/:commentId", postcontroller.unlikecomment);//
router.post("/reply/:postId/:commentId",  postcontroller.addreply);
router.get("/post/:postId/:commentId/reply/:userId", postcontroller.getCommentReplies);
router.delete("/reply/:postId/:commentId/:replyId",  postcontroller.deletereply);
router.post("/like-reply/:postId/:commentId/:replyId",   postcontroller.likereply);
router.delete("/like-reply/:postId/:commentId/:replyId",  postcontroller.unlikereply);

module.exports = router;
