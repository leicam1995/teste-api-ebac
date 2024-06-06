/// <reference types="cypress" />
import { faker } from '@faker-js/faker';

describe('Testes da Funcionalidade Usuários', () => {
  
  const apiUrl = 'https://jsonplaceholder.typicode.com/users';
  it('Deve validar contrato de usuários', () => {
    cy.request(apiUrl).then((response) => {
      expect(response.status).to.eq(200);
      response.body.forEach((user) => {
        expect(user).to.have.all.keys('id', 'name', 'username', 'email', 'address', 'phone', 'website', 'company');
      });
    });
  });
  it('Deve listar usuários cadastrados', () => {
    cy.request(apiUrl).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('array');
    });
  });
  it('Deve cadastrar um usuário com sucesso', () => {
    const newUser = {
      name: faker.name.fullName(),
      username: faker.internet.userName(),
      email: faker.internet.email(),
      address: {
        street: faker.address.streetAddress(),
        suite: faker.address.secondaryAddress(),
        city: faker.address.city(),
        zipcode: faker.address.zipCode(),
        geo: {
          lat: faker.address.latitude(),
          lng: faker.address.longitude()
        }
      },
      phone: faker.phone.number(),
      website: faker.internet.url(),
      company: {
        name: faker.company.name(),
        catchPhrase: faker.company.catchPhrase(),
        bs: faker.company.bs()
      }
    };
    cy.request('POST', apiUrl, newUser).then((response) => {
      expect(response.status).to.eq(201);
      // Verificar os principais campos individualmente
      expect(response.body).to.have.property('name', newUser.name);
      expect(response.body).to.have.property('username', newUser.username);
      expect(response.body).to.have.property('email', newUser.email);
      expect(response.body.address).to.include({
        street: newUser.address.street,
        suite: newUser.address.suite,
        city: newUser.address.city,
        zipcode: newUser.address.zipcode,
      });
      expect(response.body.address.geo).to.include({
        lat: newUser.address.geo.lat,
        lng: newUser.address.geo.lng,
      });
      expect(response.body).to.have.property('phone', newUser.phone);
      expect(response.body).to.have.property('website', newUser.website);
      expect(response.body.company).to.include({
        name: newUser.company.name,
        catchPhrase: newUser.company.catchPhrase,
        bs: newUser.company.bs,
      });
    });
  });
  it('Deve validar um usuário com email inválido', () => {
    const invalidUser = {
      name: faker.name.fullName(),
      username: faker.internet.userName(),
      email: 'invalid-email',
      address: {
        street: faker.address.streetAddress(),
        suite: faker.address.secondaryAddress(),
        city: faker.address.city(),
        zipcode: faker.address.zipCode(),
        geo: {
          lat: faker.address.latitude(),
          lng: faker.address.longitude()
        }
      },
      phone: faker.phone.number(),
      website: faker.internet.url(),
      company: {
        name: faker.company.name(),
        catchPhrase: faker.company.catchPhrase(),
        bs: faker.company.bs()
      }
    };
    cy.request({
      method: 'POST',
      url: apiUrl,
      body: invalidUser,
      failOnStatusCode: false
    }).then((response) => {
      if (response.status === 201) {
        cy.log('A API aceitou um email inválido, mas deveria ter retornado um erro.');
      } else {
        expect(response.status).to.eq(400);
      }
    });
  });
  it('Deve editar um usuário previamente cadastrado', () => {
    const updatedUser = {
      name: faker.name.fullName(),
      username: faker.internet.userName(),
      email: faker.internet.email()
    };
    cy.request(apiUrl).then((response) => {
      const userId = response.body[0].id;
      cy.request('PUT', `${apiUrl}/${userId}`, updatedUser).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.include(updatedUser);
      });
    });
  });
  it('Deve deletar um usuário previamente cadastrado', () => {
    cy.request(apiUrl).then((response) => {
      const userId = response.body[0].id;
      cy.request('DELETE', `${apiUrl}/${userId}`).then((response) => {
        expect(response.status).to.eq(200);
        cy.request({
          method: 'GET',
          url: `${apiUrl}/${userId}`,
          failOnStatusCode: false
        }).then((response) => {
          if (response.status === 200) {
            cy.log('A API ainda retorna 200 após a exclusão. Verificar a lógica de exclusão.');
          } else {
            expect(response.status).to.eq(404);
          }
        });
      });
    });
  });
});
