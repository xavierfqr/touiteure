import { faker } from "@faker-js/faker";

describe("likes tests", () => {
  it("should not display any touites", async () => {
    const userInfos = {
      email: `${faker.internet.userName()}@example.com`,
      username: `${faker.internet.userName()}`,
      password: faker.internet.password(),
      firstname: faker.internet.userName(),
      lastname: faker.internet.userName(),
    };

    cy.createAndLoginVerifiedUser({
      email: userInfos.email,
      username: userInfos.username,
      password: userInfos.password,
      firstname: userInfos.firstname,
      lastname: userInfos.lastname,
    });

    cy.visitAndCheck("/login");

    cy.findByRole("textbox", { name: /email/i }).type(userInfos.email);
    cy.findByLabelText(/password/i).type(userInfos.password);
    cy.findByRole("button", { name: /log in/i }).click();
    cy.findByText(/profile/i).click();
    cy.findByText(/likes/i).click();

    cy.get('[data-testid="touite"]').should("not.exist");
    cy.cleanupUser({ email: userInfos.email });
  });

  it.only("should display liked touites", async () => {
    const userInfos = {
      email: `${faker.internet.userName()}@example.com`,
      username: `${faker.internet.userName()}`,
      password: faker.internet.password(),
      firstname: faker.internet.userName(),
      lastname: faker.internet.userName(),
    };

    cy.createAndLoginVerifiedUser({
      email: userInfos.email,
      username: userInfos.username,
      password: userInfos.password,
      firstname: userInfos.firstname,
      lastname: userInfos.lastname,
    });

    cy.visitAndCheck("/login");

    cy.findByRole("textbox", { name: /email/i }).type(userInfos.email);
    cy.findByLabelText(/password/i).type(userInfos.password);
    cy.findByRole("button", { name: /log in/i }).click();
    const likeBtn = cy.get('[data-testid="like-btn"]').first();
    if (!likeBtn) {
      cy.cleanupUser({ email: userInfos.email });
      return;
    }
    likeBtn.click();

    cy.findByText(/profile/i).click();
    cy.findByText(/likes/i).click();

    cy.get('[data-testid="touite"]').should("exist");
    cy.cleanupUser({ email: userInfos.email });
  });
});
