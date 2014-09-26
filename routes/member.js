'use strict';

var async = require('async'),
    _ = require('lodash');

module.exports = function(data) {
  var router = require('express').Router(),
      Member = require('../schema/Member'),
      Group = require('../schema/Group'),
      util = require('./util');

  router.route('/member')
    .post(util.auth, function (req, res) {
      Member.create({
        name:         req.body.name,
        _group:       req.session.group._id,
        type:         req.body.type,
        gender:       req.body.gender,
        birthDate: {
          day:        req.body.birthDay,
          month:      req.body.birthMonth,
          year:       req.body.birthYear
        },
        phone:        req.body.phone,
        email:        req.body.email,
        emergencyContact: {
          name:       req.body.emergName,
          relation:   req.body.emergRelation,
          phone:      req.body.emergPhone
        },
        emergencyInfo: {
          medicalNum: req.body.emergMedicalNum,
          allergies:  req.body.emergAllergies,
          conditions: req.body.emergConditions
        }
      }, function (err, member) {
        if (!err && member) {
          // Refresh the group.
          Group.model.findById(member._group).exec(function (err, group) {
            if (!err && group) {
              req.session.group = group;
              res.redirect('/account');
            } else {
              var message = "Couldn't refresh your group details. You might need to relog!";
              res.redirect('/account?message=' + message);
            }
          });
        } else {
          // TODO Better error messages.
          var message = "There was an error in the validation and saving of the member. Please try again?";
          res.redirect('/account?message=' + message);
        }
      });
    })
    .get(util.auth, function (req, res) {
      // Empty form.
      res.render('templates/member', {
        session: req.session
      });
    });
  router.route('/member/:id')
    .get(util.inGroup, function (req, res) {
      Member.findById(req.params.id).exec(function (err, member) {
        if (!err && member) {
          // Populated form.
          res.render('templates/member', {
            member: member,
            session: req.session
          });
        } else {
          res.send('Sorry, there was an error finding your member. Try again?');
          console.error(err);
        }
      });
    })
    .put(util.inGroup, function (req, res) {
      Member.findById(req.body.id).exec(function (err, member) {
        if (!err && member) {
          member.name =                       req.body.name;
          member._group =                     req.session.group._id;
          member.type =                       req.body.type;
          member.gender =                     req.body.gender;
          member.birthDate.day =              req.body.birthDay;
          member.birthDate.month =            req.body.birthMonth;
          member.birthDate.year =             req.body.birthYear;
          member.phone =                      req.body.phone;
          member.email =                      req.body.email;
          member.emergencyContact.name =      req.body.emergName;
          member.emergencyContact.relation =  req.body.emergRelation;
          member.emergencyContact.phone =     req.body.emergPhone;
          member.emergencyInfo.medicalNum =   req.body.emergMedicalNum;
          member.emergencyInfo.allergies =    req.body.emergAllergies;
          member.emergencyInfo.conditions =   req.body.emergConditions;
          member._state.youthInCare =         (req.body.youthInCare == "Yes");
          member._state.youthInCareSupport =  (req.body.youthInCareSupport == "Yes");
          if (req.session.isAdmin && req.body.ticketType) {
            member._state.ticketType =        req.body.ticketType;
          }
          member.save(function (err, member) {
            if (!err && member) {
              res.redirect('/account');
            } else {
              var message = "There was an error in the validation and saving of the member. Please try again?";
              res.redirect('/account?message=' + message);
            }
          });
        } else {
          res.send('Sorry, there was an error finding that member. Try again?');
          console.error(err);
        }
      });
    })
    .delete(util.inGroup, function (req, res) {
      Member.findById(req.params.id).exec(function (err, member) {
        if (!err && member) {
          member.remove(function (err) {
            if (!err) {
              Group.model.findById(member._group).exec(function (err, group) {
                if (!err && group) {
                  req.session.group = group;
                  res.redirect('/account');
                } else {
                  var message = 'Sorry, there was an error refreshing your group. You might need to relog.';
                  res.redirect('/account?message=' + message);
                }
              });
            } else {
              res.send('Sorry, there was an error removing that member. Try again?');
              console.error(err);
            }
          });
        } else {
          res.send('Sorry, there was an error finding that member. Try again?');
          console.error(err);
        }
      });
    });

  router.get('/member/:id/workshops', util.auth, function (req, res) {
    Member.findById(req.params.id)
      .populate("_workshops._id").exec(function (err, member) {
        if (!err && member) {
          res.render('templates/memberWorkshops', {
            session: req.session,
            member: member
          });
        } else {
          var message = "There was an error getting that member and their workshops.";
          res.redirect('/account?message=' + message);
        }
      });
  });

  router.get('/member/:id/add/:workshop/:session', util.inGroup, function (req, res) {
    Member.findById(req.params.id).exec(function (err, member) {
      if (!err && member) {
        member.addWorkshop(req.params.workshop, Number(req.params.session), function (err, member) {
          var message;
          if (!err) {
            message = member.name + " has been added to session " + req.params.session + ".";
          } else {
            message = "Couldn't add that member to the workshop... Try again?";
          }
          res.redirect('/workshops/members/' + req.params.workshop + '/' + req.params.session + '?message=' + message);
        });
      } else {
        res.send('Sorry, there was an error finding that member. Try again?');
        console.error(err);
      }
    });
  });

  router.get('/member/:id/del/:workshop/:session', util.inGroup, function (req, res) {
    Member.findById(req.params.id).exec(function (err, member) {
      if (!err && member) {
        member.removeWorkshop(req.params.workshop, Number(req.params.session), function (err, member) {
          var message;
          if (!err) {
            message = member.name + " has been removed from session " + req.params.session + ".";
          } else {
            message = "Couldn't remove that member from the workshop... Try again?";
          }
          res.redirect('/workshops/members/' + req.params.workshop + '/' + req.params.session + '?message=' + message);
        });
      } else {
        res.send('Sorry, there was an error finding that member. Try again?');
        console.error(err);
      }
    });
  });

  return router;
};
