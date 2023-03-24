const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const db = require("../../../db/models");
const createPersonSchema = require("./validationSchema");
const Person = db.Person;
const Op = db.Sequelize.Op;

// Retrieve all Persons
router.get("/", (req, res) => {
  const firstName = req.query.firstName;
  let condition = firstName
    ? { firstName: { [Op.iLike]: `%${firstName}%` } }
    : null;

  Person.findAll({ where: condition })
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving persons data.",
      });
    });
});

// Retrieve a single Person with id
router.get("/:id", (req, res) => {
  const id = req.params.id;

  Person.findByPk(id)
    .then((data) => {
      if (data) {
        res.send(data);
      } else {
        res.status(404).send({
          message: `Cannot find Person with id=${id}.`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: `Error retrieving Person with id=${id}`,
      });
    });
});

// Update a Person with id
router.put("/:id", (req, res) => {
  const id = req.params.id;

  Person.update(req.body, {
    where: { id: id },
  })
    .then((num) => {
      if (num == 1) {
        res.send({
          message: "Person was updated successfully.",
        });
      } else {
        res.send({
          message: `Cannot update Person with id=${id}. Maybe Person was not found or req.body is empty!`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: `Error updating Person with id=${id}`,
      });
    });
});

// Delete a Person with id
router.delete("/:id", (req, res) => {
  const id = req.params.id;

  Person.destroy({
    where: { id: id },
  })
    .then((num) => {
      if (num == 1) {
        res.send({
          message: "Person was deleted successfully!",
        });
      } else {
        res.send({
          message: `Cannot delete Person with id=${id}. Maybe Person was not found!`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: `Error deleting Person with id=${id}`,
      });
    });
});

// Delete all persons
router.delete("/", (req, res) => {
  Person.destroy({
    where: {},
    truncate: false,
  })
    .then((nums) => {
      res.send({ message: `${nums} Persons were deleted successfully!` });
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while removing all persons data.",
      });
    });
});

// Create a new Person
router.post("/register", async (req, res) => {
  const payload = req.body;
  // Validate request
  const validatePayload = createPersonSchema(payload);
  const { error } = validatePayload;
  if (error) {
    res.status(400).send({ message: error.message });
    return;
  }
  // Save Person in the database
  const data = await Person.create({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    gender: req.body.gender,
    religion: req.body.religion,
    nationality: req.body.nationality,
    password: bcrypt.hashSync(req.body.password, 8),
  });
  res
    .status(200)
    .send({ message: "Person registered successfully...", data: data });
});

module.exports = { router };
