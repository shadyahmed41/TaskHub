const Post = require("../models/postmodel"); // Assuming you have a Post model defined
const User = require("../models/usermodel"); // Assuming you have a User model defined
const Project = require("../models/projectmodel"); // Assuming you have a Project model defined
const { createNotification } = require("../socket/notificationHandler");

exports.createpost = async (req, res) => {
  try {
    console.log("Received a request to create a post", req.body);
    const { message, type, projectId } = req.body;
    const project = await Project.findById(projectId);
    const user = await User.findOne({ "email.address": req.user.email });
    const projectID = project.leaderID.toString();
    const userID = user._id.toString();

    const data = {};

    if (type === "image" || type === "file") {
      if (!req.file) {
        return res
          .status(400)
          .json({ success: false, message: "Please select a file to upload." });
      }
      const fileContent = req.file.buffer.toString("base64");
      const fileName = req.file.originalname;

      if (type === "file") {
        data.file = { fileURL: fileContent, fileName };
      } else if (type === "image") {
        data.image = {
          imageURL: fileContent,
          imageName: fileName,
        };
      }
    }

    const postType = type || "text";

    if (!message) {
      return res
        .status(400)
        .json({ success: false, message: "Message is a required field." });
    }
    if (!project) {
      return res
        .status(400)
        .json({ success: false, message: "Project is a required field." });
    }
    if (projectID !== userID) {
      return res
        .status(400)
        .json({ success: false, message: "You Are Not The Leader." });
    }

    const newPost = new Post({
      projectId,
      message,
      ...data,
    });

    try {
      await newPost.save();
      res.json({
        success: true,
        message: `${postType} post created and saved to the database`,
      });
      const project = await Project.findById(projectId);
      project.members.map((member) => {
        createNotification(member, `Leader: created a new post in "${project.title}"`)
      })
    } catch (error) {
      console.error("Error saving post:", error.message);
      res.status(500).json({
        success: false,
        message: `Error saving ${postType} to the database`,
      });
    }
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// exports.viewposts = async (req, res) => {
//   const { projectid } = req.params;
//   const user = await User.findOne({ 'email.address': req.user.email });
//   const userid = user._id.toString();
//   console.log(projectid, userid);
//   try {
//     const project = await Project.findById({ _id: projectid });
//     if (
//       (project && project.members.includes(userid)) ||
//       project.leaderID == userid
//     ) {
//       // User ID exists in the members array
//       // console.log("User exists in project members");
//       const posts = await Post.find({ projectId: projectid }).select('-comments');
//       res.status(200).json(posts);
//     } else {
//       // User ID does not exist in the members array
//       // console.log("User does not exist in project members");
//       res
//         .status(400)
//         .json({ message: "User does not exist in project members" });
//     }
//   } catch (error) {
//     console.error("Error fetching posts:", error.message);
//     res.status(500).json({ success: false, message: "Internal Server Error" });
//   }
// };

exports.viewposts = async (req, res) => {
  const { projectid } = req.params;
  const user = await User.findOne({ 'email.address': req.user.email });
  const userid = user._id.toString();
  console.log(projectid, userid);
  try {
    const project = await Project.findById(projectid).populate('leaderID', 'name image');
    if (
      (project && (project.members.includes(userid)) ||
      project.leaderID._id == userid)
    ) {
      // User ID exists in the members array
      // console.log("User exists in project members");
      const posts = await Post.find({ projectId: projectid }).select('-comments').populate("likes", "name image.imageURL");

      // Map over the posts array to add leader's name and image to each post
      const postsWithLeader = posts.map(post => ({
        ...post.toObject(),
        liked: post.likes.some(like => like._id == userid),
        leaderId: project.leaderID._id,
        leaderName: project.leaderID.name,
        leaderImage: project.leaderID.image
      }));

      // console.log(postsWithLeader);

      //Saber
      postsWithLeader.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
      
        if (dateA > dateB) {
          return -1; 
        }
        if (dateA < dateB) {
          return 1;
        }
        return 0;
      });
      res.status(200).json(postsWithLeader);
    } else {
      // User ID does not exist in the members array
      // console.log("User does not exist in project members");
      res
        .status(400)
        .json({ message: "User does not exist in project members" });
    }
  } catch (error) {
    console.error("Error fetching posts:", error.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};


exports.deletepost = async (req, res) => {
  const { postId } = req.params;

  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res
        .status(404)
        .json({ success: false, message: "Post not found." });
    }

    const user = await User.findOne({ "email.address": req.user.email }); // Assuming you have a userId in the request body

    // Check if the user is the leader of the project
    const project = await Project.findById(post.projectId);
    if (!project.leaderID.equals(user._id)) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this post.",
      });
    }

    // If the user is the leader, delete the post
    await Post.findByIdAndDelete(postId);
    res.json({ success: true, message: "Post deleted successfully." });
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

exports.likepost = async (req, res) => {
  const { postId } = req.params;
  const { userId } = req.body;

  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res
        .status(404)
        .json({ success: false, message: "Post not found." });
    }

    // Check if the user already liked the post
    if (post.likes.includes(userId)) {
      return res
        .status(400)
        .json({ success: false, message: "User already liked the post." });
    }

    // Add user ID to the likes array
    post.likes.push(userId);
    await post.save();

    res.json({ success: true, message: "Like added successfully." });
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

exports.unlikepost = async (req, res) => {
  try {
    const { postId } = req.params;
    const { userId } = req.body;

    const post = await Post.findById(postId);

    // Check if the user liked the post
    if (!post.likes.includes(userId)) {
      return res
        .status(400)
        .json({ success: false, message: "User has not liked this post." });
    }

    // Remove user from likes array
    post.likes = post.likes.filter(
      (likeId) => likeId.toString() !== userId.toString()
    );
    await post.save();

    res.json({ success: true, message: "Post unliked successfully." });
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

exports.addcomment = async (req, res) => {
  const { postId } = req.params;
  const { userId, message } = req.body;

  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res
        .status(404)
        .json({ success: false, message: "Post not found." });
    }

    const newComment = {
      user: userId,
      message,
      // date: Date.now(),
      // likes: [], // Initialize likes array for the new comment
      // replies: [], // Initialize replies array for the new comment
    };

    post.comments.push(newComment);
    await post.save();

    res.json({
      success: true,
      message: "Comment added successfully.",
      comment: newComment,
    });
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

exports.getPostComments = async (req, res) => {
  const { postId, userId } = req.params;
  try {
    const post = await Post.findById(postId)
  .select({ comments: { replies: 0 } }) // Exclude replies from comments
  .populate([
    { path: "comments.user", select: "name image" }, // Populate user details for each comment
    { path: "comments.likes", select: "name image.imageURL" } // Populate user details for likes in comments
  ]);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    const comments = post.comments;
    const commentsWithLikes = post.comments.map(comment => ({
      ...comment.toObject(),
      liked: comment.likes.some(like => like._id == userId),
    }));
    comments.reverse();
    console.log(comments)
    res.status(200).json({comments: commentsWithLikes});
  } catch (error) {
    console.error("Error fetching post comments:", error.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

exports.deletecomment = async (req, res) => {
  const { postId, commentId } = req.params;

  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res
        .status(404)
        .json({ success: false, message: "Post not found." });
    }

    // Find the index of the comment by ID
    const commentIndex = post.comments.findIndex(
      (comment) => comment._id == commentId
    );

    // Check if the commentIndex is within bounds
    if (commentIndex === -1) {
      return res
        .status(404)
        .json({ success: false, message: "Comment not found." });
    }

    // Remove the comment at the specified index
    post.comments.splice(commentIndex, 1);
    await post.save();

    res.json({ success: true, message: "Comment deleted successfully." });
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

exports.likecomment = async (req, res) => {
  const { postId, commentId } = req.params;
  const { userId } = req.body;

  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res
        .status(404)
        .json({ success: false, message: "Post not found." });
    }

    const comment = post.comments.id(commentId);
    if (!comment) {
      return res
        .status(404)
        .json({ success: false, message: "Comment not found." });
    }

    // Check if the user has already liked the comment
    if (!comment.likes.includes(userId)) {
      // If the user has not liked the comment, add the like
      comment.likes.push(userId);
      await post.save();
      return res.json({
        success: true,
        message: "Like added to comment successfully.",
      });
    }

    res
      .status(400)
      .json({ success: false, message: "User already liked the comment." });
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

exports.unlikecomment = async (req, res) => {
  const { postId, commentId } = req.params;
  const { userId } = req.body;

  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res
        .status(404)
        .json({ success: false, message: "Post not found." });
    }

    const comment = post.comments.id(commentId);
    if (!comment) {
      return res
        .status(404)
        .json({ success: false, message: "Comment not found." });
    }

    // Check if the user has liked the comment
    const likedIndex = comment.likes.indexOf(userId);
    if (likedIndex !== -1) {
      // If the user has liked the comment, remove the like
      comment.likes.splice(likedIndex, 1);
      await post.save();
      return res.json({
        success: true,
        message: "Like removed from comment successfully.",
      });
    }

    res
      .status(400)
      .json({ success: false, message: "User has not liked the comment." });
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

exports.addreply = async (req, res) => {
  const { postId, commentId } = req.params;
  const { userId, message } = req.body;

  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res
        .status(404)
        .json({ success: false, message: "Post not found." });
    }

    const comment = post.comments.id(commentId);
    if (!comment) {
      return res
        .status(404)
        .json({ success: false, message: "Comment not found." });
    }

    const newReply = {
      user: userId,
      message,
    };

    comment.replies.push(newReply);
    await post.save();

    res.json({
      success: true,
      message: "Reply added successfully.",
      reply: newReply,
    });
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

exports.getCommentReplies = async (req, res) => {
  const { postId, commentId, userId } = req.params;
  try {
    const post = await Post.findById(postId).populate([
      { path: "comments.replies.user", select: "name image" }, // Populate user details for each comment
      { path: "comments.replies.likes", select: "name image.imageURL" } // Populate user details for likes in comments
    ]);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    const comment = post.comments.find((c) => c._id == commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }
    const replies = comment.replies;
    const repliesWithLikes = comment.replies.map(reply => ({
      ...reply.toObject(),
      liked: reply.likes.some(like => like._id == userId),
    }));
    // console.log(replies);
    res.status(200).json({replies: repliesWithLikes});
  } catch (error) {
    console.error("Error fetching comment replies:", error.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

exports.deletereply = async (req, res) => {
  const { postId, commentId, replyId } = req.params;

  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res
        .status(404)
        .json({ success: false, message: "Post not found." });
    }

    const comment = post.comments.id(commentId);
    if (!comment) {
      return res
        .status(404)
        .json({ success: false, message: "Comment not found." });
    }

    // Find the index of the reply by ID
    const replyIndex = comment.replies.findIndex(
      (reply) => reply._id == replyId
    );

    // Check if the replyIndex is within bounds
    if (replyIndex === -1) {
      return res
        .status(404)
        .json({ success: false, message: "Reply not found." });
    }

    // Remove the reply at the specified index
    comment.replies.splice(replyIndex, 1);
    await post.save();

    res.json({ success: true, message: "Reply deleted successfully." });
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

exports.likereply = async (req, res) => {
  const { postId, commentId, replyId } = req.params;
  const { userId } = req.body;

  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res
        .status(404)
        .json({ success: false, message: "Post not found." });
    }

    const comment = post.comments.id(commentId);
    if (!comment) {
      return res
        .status(404)
        .json({ success: false, message: "Comment not found." });
    }

    const reply = comment.replies.id(replyId);
    if (!reply) {
      return res
        .status(404)
        .json({ success: false, message: "Reply not found." });
    }

    // Check if the user has already liked the reply
    if (!reply.likes.includes(userId)) {
      // If the user has not liked the reply, add the like
      reply.likes.push(userId);
      await post.save();
      return res.json({
        success: true,
        message: "Like added to reply successfully.",
      });
    }

    res
      .status(400)
      .json({ success: false, message: "User already liked the reply." });
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

exports.unlikereply = async (req, res) => {
  const { postId, commentId, replyId } = req.params;
  const { userId } = req.body;

  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res
        .status(404)
        .json({ success: false, message: "Post not found." });
    }

    const comment = post.comments.id(commentId);
    if (!comment) {
      return res
        .status(404)
        .json({ success: false, message: "Comment not found." });
    }

    const reply = comment.replies.id(replyId);
    if (!reply) {
      return res
        .status(404)
        .json({ success: false, message: "Reply not found." });
    }

    // Check if the user has liked the reply
    const likedIndex = reply.likes.indexOf(userId);
    if (likedIndex !== -1) {
      // If the user has liked the reply, remove the like
      reply.likes.splice(likedIndex, 1);
      await post.save();
      return res.json({
        success: true,
        message: "Like removed from reply successfully.",
      });
    }

    res
      .status(400)
      .json({ success: false, message: "User has not liked the reply." });
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
