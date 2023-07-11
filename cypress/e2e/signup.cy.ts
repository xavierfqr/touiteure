import { faker } from "@faker-js/faker";

describe("signup tests", () => {
  it("should fail on too short password", () => {
    const loginForm = {
      email: `${faker.internet.userName()}@example.com`,
      username: `${faker.internet.userName()}`,
      password: faker.internet.password().slice(0, 2),
      firstname: faker.internet.userName(),
      lastname: faker.internet.userName(),
    };

    cy.visitAndCheck("/signup");

    cy.findByRole("textbox", { name: /email/i }).type(loginForm.email);
    cy.findByRole("textbox", { name: /username/i }).type(loginForm.username);
    cy.findByLabelText(/password/i).type(loginForm.password);
    cy.findByRole("textbox", { name: /firstname/i }).type(loginForm.firstname);
    cy.findByRole("textbox", { name: /lastname/i }).type(loginForm.lastname);

    cy.findByRole("button", { name: /create account/i }).click();

    cy.get("#password-error")
      .should("be.visible")
      .contains("Password is too short");
  });

  it("should fail on unfilled username", () => {
    const loginForm = {
      email: `${faker.internet.userName()}@example.com`,
      password: faker.internet.password(),
      firstname: faker.internet.userName(),
      lastname: faker.internet.userName(),
    };

    cy.visitAndCheck("/signup");

    cy.findByRole("textbox", { name: /email/i }).type(loginForm.email);
    cy.findByLabelText(/password/i).type(loginForm.password);
    cy.findByRole("button", { name: /create account/i }).click();
    cy.findByRole("textbox", { name: /firstname/i }).type(loginForm.firstname);
    cy.findByRole("textbox", { name: /lastname/i }).type(loginForm.lastname);

    cy.get("#username-error")
      .should("be.visible")
      .contains("Username is required");
  });

  it("should fail on signup because username is already in use", () => {
    const loginForm = {
      email: `${faker.internet.userName()}@example.com`,
      username: `alreadyexisting`,
      password: faker.internet.password(),
      firstname: faker.internet.userName(),
      lastname: faker.internet.userName(),
    };

    cy.visitAndCheck("/signup");

    cy.intercept("POST", "/signup?_data=routes%2Fsignup", {
      fixture: "existing-username.json",
    }).as("signupRequest");

    cy.findByRole("textbox", { name: /email/i }).type(loginForm.email);
    cy.findByRole("textbox", { name: /username/i }).type(loginForm.username);
    cy.findByLabelText(/password/i).type(loginForm.password);
    cy.findByRole("textbox", { name: /firstname/i }).type(loginForm.firstname);
    cy.findByRole("textbox", { name: /lastname/i }).type(loginForm.lastname);

    cy.findByRole("button", { name: /create account/i }).click();

    cy.wait("@signupRequest");

    cy.get("#username-error")
      .should("be.visible")
      .contains("A user already exists with this username");
  });

  it("should allow you to register and login", () => {
    const loginForm = {
      email: `${faker.internet.userName()}@example.com`,
      username: `${faker.internet.userName()}`,
      password: faker.internet.password(),
      firstname: faker.internet.userName(),
      lastname: faker.internet.userName(),
    };

    cy.then(() => ({ email: loginForm.email })).as("user");

    cy.visitAndCheck("/");

    cy.findByRole("link", { name: /sign up/i }).click();

    cy.findByRole("textbox", { name: /email/i }).type(loginForm.email);
    cy.findByRole("textbox", { name: /username/i }).type(loginForm.username);
    cy.findByLabelText(/password/i).type(loginForm.password);
    cy.findByRole("textbox", { name: /firstname/i }).type(loginForm.firstname);
    cy.findByRole("textbox", { name: /lastname/i }).type(loginForm.lastname);

    cy.findByRole("button", { name: /create account/i }).click();

    cy.cleanupUser();

    // cy.findByRole("link", { name: /notes/i }).click();
    // cy.findByRole("button", { name: /logout/i }).click();
    // cy.findByRole("link", { name: /log in/i });
  });

  // it("should allow you to make a note", () => {
  //   const testNote = {
  //     title: faker.lorem.words(1),
  //     body: faker.lorem.sentences(1),
  //   };
  //   cy.login();

  //   cy.visitAndCheck("/");

  //   cy.findByRole("link", { name: /notes/i }).click();
  //   cy.findByText("No notes yet");

  //   cy.findByRole("link", { name: /\+ new note/i }).click();

  //   cy.findByRole("textbox", { name: /title/i }).type(testNote.title);
  //   cy.findByRole("textbox", { name: /body/i }).type(testNote.body);
  //   cy.findByRole("button", { name: /save/i }).click();

  //   cy.findByRole("button", { name: /delete/i }).click();

  //   cy.findByText("No notes yet");
  // });
});
