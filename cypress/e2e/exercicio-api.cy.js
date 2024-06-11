/// <reference types="cypress" />
import { faker } from '@faker-js/faker';

describe('Testes da Funcionalidade Usuários na API Serverest', () => {
    let token;
    const apiUrl = 'https://serverest.dev/usuarios';

    before(() => {
        cy.request({
            method: 'POST',
            url: 'https://serverest.dev/login',
            body: {
                email: 'fulano@qa.com',
                password: 'teste'
            }
        }).then((response) => {
            expect(response.status).to.eq(200);
            token = response.body.authorization;
            Cypress.env('token', token);
        });
    });

    it('Deve validar contrato de usuários', () => {
        cy.request(apiUrl).then((response) => {
            expect(response.status).to.eq(200);
            response.body.usuarios.forEach((user) => {
                expect(user).to.have.all.keys('_id', 'nome', 'email', 'password', 'administrador');
            });
        });
    });

    it('Deve listar usuários cadastrados', () => {
        cy.request(apiUrl).then((response) => {
            expect(response.status).to.eq(200);
            expect(response.body.usuarios).to.be.an('array');
        });
    });

    it('Deve cadastrar um usuário com sucesso', () => {
        const newUser = {
            nome: faker.name.fullName(),
            email: faker.internet.email(),
            password: faker.internet.password(),
            administrador: 'true'
        };
        cy.request({
            method: 'POST',
            url: apiUrl,
            body: newUser,
            headers: { Authorization: `Bearer ${Cypress.env('token')}` }
        }).then((response) => {
            expect(response.status).to.eq(201);
            expect(response.body.message).to.eq('Cadastro realizado com sucesso');
        });
    });

    it('Deve validar um usuário com email inválido', () => {
        const invalidUser = {
            nome: faker.name.fullName(),
            email: 'invalid-email',
            password: faker.internet.password(),
            administrador: 'true'
        };
        cy.request({
            method: 'POST',
            url: apiUrl,
            body: invalidUser,
            failOnStatusCode: false,
            headers: { Authorization: `Bearer ${Cypress.env('token')}` }
        }).then((response) => {
            expect(response.status).to.eq(400);
            if (response.body && response.body.message) {
                expect(response.body.message).to.include('email deve ser um email válido');
            } else {
            }
        });
    });

    it('Deve editar um usuário previamente cadastrado', () => {
        const updatedUser = {
            nome: faker.name.fullName(),
            email: faker.internet.email(),
            password: faker.internet.password(),
            administrador: 'true'
        };
        cy.request(apiUrl).then((response) => {
            const userId = response.body.usuarios[0]._id;
            cy.request({
                method: 'PUT',
                url: `${apiUrl}/${userId}`,
                body: updatedUser,
                headers: { Authorization: `Bearer ${Cypress.env('token')}` }
            }).then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body.message).to.eq('Registro alterado com sucesso');
            });
        });
    });

    it('Deve deletar um usuário previamente cadastrado', () => {
        cy.request(apiUrl).then((response) => {
            const userId = response.body.usuarios[0]._id;
            cy.request({
                method: 'DELETE',
                url: `${apiUrl}/${userId}`,
                failOnStatusCode: false,
                headers: { Authorization: `Bearer ${Cypress.env('token')}` }
            }).then((response) => {
                if (response.status === 200) {
                    expect(response.body.message).to.eq('Registro excluído com sucesso');
                } else if (response.status === 400) {
                    expect(response.body.message).to.eq('Não é permitido excluir usuário com carrinho cadastrado');
                    cy.log(`ID do carrinho associado: ${response.body.idCarrinho}`);
                } else {
                    expect(response.status).to.eq(404);
                }
            });
        });
    });
});
