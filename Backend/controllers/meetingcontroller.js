const User = require("../models/usermodel");
const Meeting = require("../models/meetingmodel");
const PDFDocument = require('pdfkit');
const fs = require('fs');
require('../classes/meetingScheduler');

exports.meetingDetails = async (req, res) => {
  try {
    const { projectId } = req.params;
    //   console.log(projectId);

    const user = await User.findOne({ "email.address": req.user.email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    //   const meeting = await Meeting.findById(projectId);
    const meeting = await Meeting.find({ projectId: projectId });
    //   console.log("meeting", meeting);

    if (!meeting || meeting.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No meetings found for the provided project ID",
      });
    }

    // Format meetings data for response
    const formattedMeetings = meeting.map((meeting) => ({
      _id: meeting._id,
      title: meeting.title,
      keypoints: meeting.keypoints,
      date: meeting.startDate,
      ended: meeting.ended
    }));

    res.status(200).json({
      success: true,
      meeting: formattedMeetings,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

exports.meetingsummary = async (req, res) => {
  try {
    const { meetingid } = req.params;
    // console.log("meetingid",meetingid);

    const user = await User.findOne({ "email.address": req.user.email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    const meetingsummary = await Meeting.findById(meetingid).populate(
      "participants",
      "name"
    );
    // console.log("meetingSummary", meetingsummary);

    if (!meetingsummary || meetingsummary.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No meetings found with this id",
      });
    }
    res.status(200).json({
      success: true,
      meetingsummary: {
        _id: meetingsummary._id,
        title: meetingsummary.title,
        keypoints: meetingsummary.keypoints,
        date: meetingsummary.startDate,
        participants: meetingsummary.participants.map((participant) => {
          return {
            id: participant._id,
            name: participant.name, // Assuming 'name' is a field in the User schema
          };
        }),
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

exports.updatemeeting = async (req, res) => {
  try {
    const { keypoints } = req.body;
    console.log("key", keypoints);
    const { meetingid } = req.params;
    console.log(meetingid);

    // Find the meeting by its ID and update the keypoints and outcome fields
    const updatedMeeting = await Meeting.findByIdAndUpdate(
      meetingid, // Assuming you're passing the meeting ID in the request parameters
      { $set: { keypoints } }, // Update keypoints and outcome fields
      { new: true } // Return the updated document
    );

    if (!updatedMeeting) {
      return res.status(404).json({
        success: false,
        message: "Meeting not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Meeting updated successfully",
      data: updatedMeeting,
    });
  } catch (error) {
    console.error("Error updating meeting:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

exports.addkeypoint = async (req, res) => {
  try {
    const { meetingid } = req.params;
    const { keypoint } = req.body;
    const meeting = await Meeting.findById(meetingid);
    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: "Meeting not found",
      });
    }
    meeting.keypoints.push(keypoint);
    await meeting.save();
    res.status(200).json({
      success: true,
      message: "Meeting Updated",
    });
  } catch (error) {
    console.error("Error updating meeting:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

exports.addoutcomes = async (req, res) => {
  try {
    const { meetingid, keypointid } = req.params;
    const { outcome } = req.body;
    const meeting = await Meeting.findById(meetingid);
    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: "Meeting not found",
      });
    }
    const keypoint = meeting.keypoints.find(
      (keypoint) => keypoint._id.toString() === keypointid
    );
    if (!keypoint) {
      return res.status(404).json({
        success: false,
        message: "Keypoint not found in the meeting",
      });
    }
    const newOutcome = {
      outcome: outcome,
    };
    keypoint.outcomes.push(newOutcome);
    await meeting.save();
    return res.status(200).json({
      success: true,
      message: "Outcome added to keypoint successfully",
    });
  } catch (error) {
    console.error("Error updating meeting:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

exports.deleteKeypoint = async (req, res) => {
  try {
    const { meetingid, keypointid } = req.params;
    const meeting = await Meeting.findById(meetingid);
    
    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: "Meeting not found",
      });
    }
    
    // Find the index of the keypoint to be deleted
    const keypointIndex = meeting.keypoints.findIndex(
      (keypoint) => keypoint._id.toString() === keypointid
    );
    
    if (keypointIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Keypoint not found in the meeting",
      });
    }

    // Remove the keypoint from the array
    meeting.keypoints.splice(keypointIndex, 1);
    
    await meeting.save();
    
    return res.status(200).json({
      success: true,
      message: "Keypoint deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting keypoint:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

exports.deleteOutcome = async (req, res) => {
  try {
    const { meetingid, keypointid, outcomeid } = req.params;
    const meeting = await Meeting.findById(meetingid);
    
    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: "Meeting not found",
      });
    }
    
    const keypoint = meeting.keypoints.find(
      (keypoint) => keypoint._id.toString() === keypointid
    );

    if (!keypoint) {
      return res.status(404).json({
        success: false,
        message: "Keypoint not found in the meeting",
      });
    }

    // Find the index of the outcome to be deleted
    const outcomeIndex = keypoint.outcomes.findIndex(
      (outcome) => outcome._id.toString() === outcomeid
    );

    if (outcomeIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Outcome not found in the keypoint",
      });
    }

    // Remove the outcome from the array
    keypoint.outcomes.splice(outcomeIndex, 1);

    await meeting.save();
    
    return res.status(200).json({
      success: true,
      message: "Outcome deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting outcome:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

exports.generatesummarypdf = async (req, res) => {
  try {
      const { meetingid } = req.params;

      // Retrieve meeting details from the database
      const meeting = await Meeting.findById(meetingid).populate('projectId').exec();

      console.log(meeting);

      if (!meeting) {
          return res.status(404).send('Meeting not found');
      }

      // Create a new PDF document
      const doc = new PDFDocument();

      // Set response headers for PDF file
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${meeting.title}_summary.pdf"`);

      // Pipe PDF content to response
      doc.pipe(res);

      // Add content to the PDF document
      doc.fontSize(16).text(`Meeting Summary: ${meeting.title}`, { align: 'center' });
      doc.moveDown();
      doc.fontSize(12).text(`Project: ${meeting.projectId.title}`);
      doc.moveDown();
      doc.fontSize(12).text(`Start Date: ${meeting.startDate.toDateString()}`);
      doc.moveDown();

      // Add keypoints and outcomes to the PDF
      meeting.keypoints.forEach((keypoint, index) => {
          doc.fontSize(12).text(`Keypoint ${index + 1}: ${keypoint.keypoint}`);
          keypoint.outcomes.forEach((outcome, subIndex) => {
              doc.fontSize(10).text(`  Outcome ${subIndex + 1}: ${outcome.outcome}`, { indent: 20 });
          });
          doc.moveDown();
      });

      // End PDF document
      doc.end();
  } catch (error) {
      console.error('Error generating meeting PDF:', error);
      res.status(500).send('Internal Server Error');
  }
};