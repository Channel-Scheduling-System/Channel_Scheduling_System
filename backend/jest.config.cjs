const config = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    testMatch: ['**/*.test.ts'],
    transform: {
        '^.+\\.tsx?$': [
            'ts-jest',
            {
                tsconfig: '<rootDir>/tests/tsconfig.json',
            },
        ],
    },
    moduleNameMapper: {
        '^#/(.*)\\.js$': '<rootDir>/src/$1.ts',
        '^#/(.*)$': '<rootDir>/src/$1',
        '^(\\.{1,2}/.*)\\.js$': '$1',
    },

    // ── Cobertura ────────────────────────────────────────────────────────────
    coverageDirectory: 'coverage',
    coverageReporters: ['lcov', 'text', 'text-summary'],

    /**
     * Archivos incluidos en el reporte de cobertura.
     * Se excluyen archivos de infraestructura (repositorios, rutas, módulos)
     * que requieren base de datos o servidor HTTP para ejecutarse.
     */
    collectCoverageFrom: [
        'src/**/*.ts',
        // Infraestructura / wiring
        '!src/**/*.repository.ts',
        '!src/**/*.routes.ts',
        '!src/**/*.module.ts',
        '!src/**/index.ts',
        // Tipos y declaraciones
        '!src/**/*.types.ts',
        '!src/**/*.d.ts',
        '!src/types/**',
        // Arranque del servidor
        '!src/server.ts',
        '!src/app.ts',
        // Configuración
        '!src/config/**',
        // Servicios externos que requieren SMTP
        '!src/shared/services/email/nodemailer.service.ts',
        '!src/shared/services/email/templates/**',
        '!src/shared/services/email/index.ts',
        // Constantes (solo datos, sin lógica)
        '!src/shared/constants/**',
    ],

    /**
     * Umbral mínimo de cobertura: 70 % en todas las dimensiones.
     * El pipeline de CI fallará si no se alcanza.
     */
    coverageThreshold: {
        global: {
            statements: 70,
            branches: 70,
            functions: 70,
            lines: 70,
        },
    },
};

module.exports = config;
