pipeline {
    agent any

    stages {
        stage('Configurações iniciais'){
            steps {
                sh 'npm install'
            }
        }
        stage('Execução dos Cypress'){
            steps {
                sh 'NO_COLOR=1 npm run cy:run-ci'
            }
        }
    }

}