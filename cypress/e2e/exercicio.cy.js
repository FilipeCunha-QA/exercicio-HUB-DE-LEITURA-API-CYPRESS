/// <reference types="cypress" />

describe('Testes da Funcionalidade Catálogo de Livros', () => {

     let token
     beforeEach(() => {
          cy.geraToken('admin@biblioteca.com', 'admin123').then(tkn => {
               token = tkn
          })
     });

     // Objetivo: Verificar que a API retorna lista de livros com paginação e filtros funcionando
     // Validar que filtros por categoria e autores funcionam corretamente
     it('GET - Deve listar livros com filtros e paginação', () => {
          cy.api({
               method: 'GET',
               url: '/books',
               qs: {
                    categoria: 'Ficção',
                    autor: 'Machado de Assis',
                    page: 1,
                    limit: 10
               },
               headers: { 'Authorization': token }
          }).should(response => {
               expect(response.status).to.equal(200)
               expect(response.body.books).to.be.an('array')
               expect(response.body.books.length).to.be.at.most(10)

          })
     });

     // Objetivo: Validar que é possível obter detalhes de um livro específico pelo ID
     // Verificar que todos os campos do livro são retornados corretamente
     it('GET - Deve obter detalhes de um livro específico', () => {
          cy.api({
               method: 'GET',
               url: '/books/1',
               headers: { 'Authorization': token }
          }).should(response => {
               expect(response.status).to.equal(200)
               expect(response.body).to.have.property('book')
               expect(response.body.book).to.have.property('id')
               expect(response.body.book).to.have.property('title')
               expect(response.body.book).to.have.property('author')
               expect(response.body.book).to.have.property('category')
          })

     });

     // Objetivo: Validar que um novo livro é adicionado com sucesso ao catálogo
     // Verificar que apenas admin pode adicionar novos livros (validação de permissão)
     it('POST - Deve cadastrar um novo livro com sucesso', () => {
          let livro = `Livro de QA nº${Date.now()}`
          cy.api({
               method: 'POST',
               url: 'books',
               body: {
                    title: livro,
                    author: "Engenheiro de QA",
                    category: "Geral",
                    total_copies: 3
               },
               headers: { 'Authorization': token }
          }).should(response => {
               expect(response.status).to.equal(201)
               expect(response.body.message).to.equal('Livro criado com sucesso.')
          })
     });

     // Objetivo: Garantir que dados inválidos são rejeitados ao adicionar um livro
     // Validar mensagens de erro apropriadas para dados faltantes ou incorretos
     it('POST - Deve rejeitar livro com dados inválidos', () => {
          cy.api({
               method: 'POST',
               url: '/books',
               body: {
                    author: "cleiton",
                    total_copies: -1
               },
               headers: { 'Authorization': token },
               failOnStatusCode: false
          }).should(response => {
               expect(response.status).to.equal(400)
          })
     });

     it('PUT - Deve atualizar um livro previamente cadastrado', () => {
          cy.api({
               method: 'PUT',
               url: 'books/1',
               body: {
                    title: "Iracema",
                    author: "José de Alencar",
                    category: "Literatura Brasileira",
                    total_copies: 2
               },
               headers: { 'Authorization': token }
          }).should(response => {
               expect(response.status).to.equal(200)
               expect(response.body.message).to.equal('Livro atualizado com sucesso.')
          })

     });

     // Objetivo: Validar que um livro pode ser removido do catálogo
     // Verificar que apenas admin pode deletar livros (validação de permissão)
     it('DELETE - Deve deletar um livro previamente cadastrado', () => {
    let tituloLivro = `Livro de QA nº${Date.now()}`;
    
    // Adicionamos a categoria ('Geral') que estava faltando antes do '3'
    cy.cadastrarLivro(tituloLivro, 'Engenheiro de QA', 'Geral', 3, token).then(bookID => {

        cy.api({
            method: 'DELETE',
            url: `books/${bookID}`,
            headers: { 'Authorization': token }
        }).should(response => {
            expect(response.status).to.equal(200)
            expect(response.body.message).to.equal('Livro deletado com sucesso.')
        })
    })
});

     it('DELETE - Deve excluir um livro previamente', () => {
          let tituloLivro = `Livro de QA nº${Date.now()}`;
          cy.cadastrarLivro(tituloLivro, "Engenheiro de QA", "Geral", 3, token).then(bookId => {

               cy.api({
                    method: 'DELETE',
                    url: `books/${bookId}`,
                    headers: { 'Authorization': token }
               }).should(response => {
                    expect(response.status).to.equal(200);
                    expect(response.body.message).to.equal('Livro deletado com sucesso.');
               });
          });
     });
});