export type Language = "en" | "pt" | "es";

export const translations = {
  en: {
    // Login
    tagline: "Your immunization passport, always with you.",
    privacyNote:
      "Your clinical data is encrypted and stored on the blockchain using",
    privacyNote2: "to ensure absolute privacy.",
    connecting: "Connecting...",
    connected: "Connected",
    connectButton: "Connect with Midnight",
    secureConnection: "Secure Anonymized Connection",
    learnMore: "Learn more about midnight",
    needHelp: "Need help?",
    walletNotFound:
      "Midnight Connector (Lace) not found. Please install the extension.",
    shieldedAddressNotFound: "Shielded address not found.",
    connectionFailed: "Failed to connect to wallet.",

    // Dashboard header
    loggedInAs: "Logged in as",
    logout: "Logout",

    // Welcome section
    welcomeBack: "Welcome back",
    headline: "Your health in\nperfect harmony.",
    overallStatus: "Overall Status",
    immunized: "92% Immunized",

    // Next vaccine card
    nextDose: "Next Dose",
    nextVaccineName: "Influenza Booster 2024",
    nextVaccineDesc:
      "Your annual dose is available for scheduling. Keep your protection up to date.",
    scheduleNow: "Schedule now",
    viewDetails: "View details",

    // Progress
    progress: "Progress",
    infantCycle: "Infant Cycle",
    completed: "Completed",
    boosterDoses: "Booster Doses",
    outOf4: "3 of 4",
    internationalTravel: "International Travel",
    pending: "Pending",

    // Recent history
    recentHistory: "Recent History",
    viewAll: "View all",
    validated: "Validated",
    activities: [
      {
        title: "COVID-19 Bivalent",
        subtitle: "Single Dose • Central Unit",
        date: "Mar 12, 2024",
        icon: "shield",
      },
      {
        title: "Hepatitis B",
        subtitle: "3rd Dose • Santa Fé Clinic",
        date: "Jan 15, 2024",
        icon: "water_drop",
      },
      {
        title: "Yellow Fever",
        subtitle: "Booster Dose • Mobile Post",
        date: "Dec 05, 2023",
        icon: "science",
      },
    ],

    // Info cards
    nearestClinic: "Nearest clinic",
    nearestClinicDesc: "Central Unit - 0.8km away. Open until 8:00 PM.",
    viewOnMap: "View on map",
    familyGroup: "Family Group",
    familyGroupDesc:
      "Your dependents (2) are up to date on their schedule. Great job!",
    manageFamily: "Manage family",

    // Wallet view
    vaccinationWallet: "Vaccination Wallet",
    walletSubtitle:
      "Track your immunization history with clinical precision and total security.",
    filterAll: "All",
    filterInfant: "Infant",
    filterAdult: "Adult",
    filterTravel: "Travel",
    latestUpdate: "Latest Update",
    covidBooster: "COVID-19 Booster",
    bivalentDose: "Bivalente Dose - Complete protection against variants.",
    lastUpdateDate: "October 14, 2023",
    completedStatus: "COMPLETED",
    vaccines: {
      influenza: "Influenza (Flu)",
      yellowFever: "Yellow Fever",
      hepatitisB: "Hepatitis B",
      mmr: "MMR (Measles, Mumps, Rubella)",
      td: "Tetanus and Diphtheria (Td)",
    },
    categories: {
      adult: "Adult Category",
      travel: "Travel Category",
      infant: "Infant Category",
      booster: "10-year Booster",
    },

    // Add Vaccine View
    registerVaccine: "Register Vaccine",
    addVaccineSubtitle:
      "Add a new dose to your medical history to keep your protection always up to date and secure.",
    vaccineName: "Vaccine Name",
    vaccinePlaceholder: "Ex: Influenza, COVID-19, Hepatitis B...",
    doseDate: "Dose Date",
    lotNumber: "Batch/Lot",
    optional: "optional",
    applicationLocation: "Application Location",
    locationPlaceholder: "Ex: Central Clinic, Local Pharmacy...",
    locationTip:
      "Tip: Use the official name of the health center or clinic for better tracking.",
    secureRegistry: "Secure Registry",
    secureRegistryDesc:
      "Your health information is encrypted and used only for your personal immunization control.",
    saveRegistry: "Save Registry",
    forgotDate: "Forgot the date?",
    forgotDateDesc:
      "You can check your physical Vaccination Card to find the exact dates and batch number.",
    boosterReminder: "Booster Reminder",
    boosterReminderDesc:
      "Upon saving, Clinical Sanctuary will automatically calculate the date for your next booster dose, if applicable.",

    // Publish Contract View
    publishContract: "Publish Contract",
    publishContractSubtitle:
      "Deploy a new VaxZk smart contract to the Midnight network.",
    contractName: "Contract Name",
    contractNamePlaceholder: "Ex: VaxZk Core v1.0",
    network: "Network",
    networkTestnet: "Testnet",
    networkDevnet: "Devnet",
    deploying: "Deploying...",
    deployContractButton: "Deploy Contract",
    deploySuccess: "Contract deployed successfully!",
    adminKey: "Initial Admin (Optional)",
    adminKeyPlaceholder: "Leave empty to use current wallet",
    contractParamsTitle: "Contract Parameters",
    contractDesc:
      "The constructor will automatically set your wallet as the initial admin. Further clinics can be added later.",

    // Deploy Contract View
    deployContract: "Deploy Contract",
    deployContractSubtitle:
      "Deploy a new VaxZk smart contract to the Midnight network.",

    // Vaccines Admin
    manage: "Manage",
    vaccinesAdminTitleEnd: "Vaccines",
    vaccinesAdminSubtitle:
      "List and Add new vaccination proof requests to the system.",
    vaccinesList: "Registered Vaccines",
    add: "Add",
    loading: "Processing...",

    // Manage Access
    accessAdminTitleEnd: "Access",
    accessAdminSubtitle: "Manage user permissions",
    accessAddAdminTitle: "Add a new Admin",
    accessAddAdminLink: "Create invitation link",
    accessAddAdminDesc:
      "Create an invitation link and send it to the user to become an admin.",
    accessAddClinicTitle: "Add a new Clinic",
    accessAddAClinicLink: "Create invitation link",
    accessAddClinicDesc:
      "Create an invitation link and send it to the user to become an clinic.",
    removeAccess: "Remove my admin access",

    // List Clinics View
    listClinicsTitle: "List of Clinics",
    listClinicsSubtitle: "Find authorized vaccination centers near you",
    registeredClinics: "Registered Clinics",
    searchClinics: "Search clinics...",
    authorizedCenter: "Authorized Vaccination Center",
    verifiedProvider: "Verified Provider",
    noClinicsFound: "No clinics found",
    tryDifferentSearch: "Try a different search term",
    noClinicsRegistered: "No clinics have been registered yet",
    needHelpFinding: "Need help finding a clinic?",
    contactLocalHealth:
      "Contact your local health authority for the most up-to-date information about vaccination centers.",

    // Shared UI
    cancel: "Cancel",
    online: "Online",
    unnamed: "Unnamed",
    coordinates: "Coordinates:",
    issuerLabel: "Issuer:",
    noIssuerRegistered: "No issuer registered",
    reqIdLabel: "Req ID:",
    errConnectContract: "Failed to connect to the contract",

    // Access Admin
    inviteLinkCreated: "Invitation link created!",
    inviteLinkStoredDesc: "Share this link securely with the intended recipient.",
    copyLink: "Copy link",
    removeAdminTitle: "Remove my admin access",
    removeAdminDesc: "Remove your admin permissions from the blockchain. This action cannot be undone.",
    adminAccessRemoved: "Admin access removed successfully!",
    errCreateInvite: "Failed to create invite: ",
    errRemoveAdmin: "Failed to remove admin: ",

    // Deploy Contract
    deploySuccessDesc: "This address is stored in your browser. All views will use it automatically on the next page load.",
    copyAddress: "Copy address",

    // Metrics Admin
    totalVaccinesRegistered: "Total Vaccines Registered",
    activeAdmins: "Active Admins",
    activeVerifierOwners: "Active Verifier Owners",
    totalClinicsMetric: "Total Clinics",
    pendingAdminInvites: "Pending Admin Invites",
    pendingVerifierInvites: "Pending Verifier Invites",

    // Issuers Admin
    issuersAdminTitleEnd: "Certificate Issuers",
    issuersAdminSubtitle: "Register and review the organizations authorized to issue vaccine certificates.",
    addIssuer: "Add Issuer",
    addingIssuer: "Adding Issuer...",
    vaccinationCertIssuers: "Vaccination Certificate Issuers",
    loadingIssuers: "Loading issuers...",
    noIssuersRegistered: "No issuers registered yet.",
    addCertIssuerTitle: "Add Certificate Issuer",
    addIssuerInfo: "To register a certificate issuer, contact the vaccine certificate provider/issuer to obtain their details (name, service URI, verification endpoint, and public key).",
    issuerName: "Issuer Name",
    issuerUri: "Issuer URI",
    verificationEndpoint: "Verification Endpoint",
    verificationEndpointDesc: "URL used by administrative agents or personnel to verify the authenticity of a vaccination certificate.",
    publicKey: "Public Key",
    issuerNamePlaceholder: "e.g. National Health Authority",
    issuerUriPlaceholder: "e.g. https://issuer.example.com",
    issuerVerifEndpointPlaceholder: "e.g. https://issuer.example.com/verify",
    issuerKeyPlaceholder: "Public key provided by the issuer",
    issuerShieldedId: "Issuer Shielded Id:",
    signaturePubKey: "Signature Public Key:",
    uriLabel: "URI:",
    verificationEndpointLabel: "Verification Endpoint:",

    // Clinics Admin
    clinicsTitleEnd: "Clinics",
    manageClinicsSubtitle: "Register your clinics on-chain and view all currently registered clinics.",
    registerNewClinic: "Register New Clinic",
    clinicName: "Clinic Name",
    clinicAddress: "Address",
    latitude: "Latitude",
    longitude: "Longitude",
    clinicNamePlaceholder: "e.g. City Health Clinic",
    addressPlaceholder: "e.g. 123 Main St, Springfield",
    latitudePlaceholder: "e.g. -23.5990263",
    longitudePlaceholder: "e.g. -46.6419712",
    onlineClinic: "Online clinic (offers remote/telehealth services)",
    registering: "Registering...",
    registerClinic: "Register Clinic",
    loadingClinics: "Loading clinics...",
    noClinicsOnChain: "No clinics registered on-chain yet.",
    clinicShieldedId: "Clinic Shielded ID:",
    ownerShieldedId: "Owner Shielded ID:",

    // Vaccine Proof Requests (shared between AddVaccineView and UserProofRequestsView)
    vaccineProofRequests: "Vaccine Proof Requests",
    newRequest: "New Request",
    loadingProofRequests: "Loading proof requests...",
    noProofRequestsYet: "No proof requests on-chain yet.",
    submitted: "Submitted",
    newVaccineProofRequest: "New Vaccine Proof Request",
    vaccineLabel: "Vaccine",
    loadingVaccines: "Loading vaccines...",
    noVaccinesRegistered: "No vaccines registered",
    selectVaccine: "Select a vaccine...",
    patientId: "Patient ID",
    validUntilLabel: "Valid Until",
    requesting: "Requesting...",
    requestVaccineProofBtn: "Request Vaccine Proof",
    errRequestVaccineProof: "Failed to request vaccine proof: ",
    patientIdPlaceholder: "e.g. PASSPORT-001",

    // User Proof Requests View
    myProofsTitleStart: "My",
    myProofsTitleEnd: "Vaccine Proofs",
    vaccineProofsSubtitle: "View and submit your vaccine proof requests.",
    submitting: "Submitting…",
    submitProof: "Submit Proof",
    errNoIssuerFound: "No registered issuer found.",
    errSubmitProof: "Failed to submit proof: ",

    // Bottom Nav
    navMyProofs: "My Proofs",
    navClinics: "Clinics",
    navVaccines: "Vaccines",
    navProfile: "Profile",
    navMetrics: "Metrics",
    navAccess: "Access",
    navIssuers: "Issuers",
  },
  pt: {
    // Login
    tagline: "Seu passaporte de imunização, sempre com você.",
    privacyNote:
      "Seus dados clínicos são criptografados e armazenados na blockchain usando",
    privacyNote2: "para garantir privacidade absoluta.",
    connecting: "Iniciando...",
    connected: "Conectado",
    connectButton: "Entrar com Midnight",
    secureConnection: "Conexão Segura e Anonimizada",
    learnMore: "Saiba mais sobre o Midnight",
    needHelp: "Precisa de ajuda?",
    walletNotFound:
      "Midnight Connector (Lace) não encontrado. Por favor, instale a extensão.",
    shieldedAddressNotFound: "Endereço blindado não encontrado.",
    connectionFailed: "Falha ao conectar à carteira.",

    // Dashboard header
    loggedInAs: "Logado como",
    logout: "Sair",

    // Welcome section
    welcomeBack: "Bem-vindo de volta",
    headline: "Sua saúde em\nperfeita harmonia.",
    overallStatus: "Status Geral",
    immunized: "92% Imunizado",

    // Next vaccine card
    nextDose: "Próxima Dose",
    nextVaccineName: "Reforço Influenza 2024",
    nextVaccineDesc:
      "Sua dose anual está disponível para agendamento. Mantenha sua proteção atualizada.",
    scheduleNow: "Agendar agora",
    viewDetails: "Ver detalhes",

    // Progress
    progress: "Progresso",
    infantCycle: "Ciclo Infantil",
    completed: "Concluído",
    boosterDoses: "Doses de Reforço",
    outOf4: "3 de 4",
    internationalTravel: "Viagens Internacionais",
    pending: "Pendente",

    // Recent history
    recentHistory: "Histórico Recente",
    viewAll: "Ver tudo",
    validated: "Validada",
    activities: [
      {
        title: "COVID-19 Bivalente",
        subtitle: "Dose Única • Unidade Central",
        date: "12 Mar, 2024",
        icon: "shield",
      },
      {
        title: "Hepatite B",
        subtitle: "3ª Dose • Clínica Santa Fé",
        date: "15 Jan, 2024",
        icon: "water_drop",
      },
      {
        title: "Febre Amarela",
        subtitle: "Dose de Reforço • Posto Móvel",
        date: "05 Dez, 2023",
        icon: "science",
      },
    ],

    // Info cards
    nearestClinic: "Clínica mais próxima",
    nearestClinicDesc:
      "Unidade Central - 0.8km de distância. Aberto até as 20:00.",
    viewOnMap: "Ver no mapa",
    familyGroup: "Grupo Familiar",
    familyGroupDesc:
      "Seus dependentes (2) estão com o calendário em dia. Ótimo trabalho!",
    manageFamily: "Gerenciar família",

    // Wallet view
    vaccinationWallet: "Carteira de Vacinação",
    walletSubtitle:
      "Acompanhe seu histórico de imunização com precisão clínica e total segurança.",
    filterAll: "Todas",
    filterInfant: "Infantil",
    filterAdult: "Adulto",
    filterTravel: "Viagem",
    latestUpdate: "Última Atualização",
    covidBooster: "Reforço COVID-19",
    bivalentDose: "Dose Bivalente - Proteção completa contra variantes.",
    lastUpdateDate: "14 de Outubro, 2023",
    completedStatus: "CONCLUÍDO",
    vaccines: {
      influenza: "Gripe (Influenza)",
      yellowFever: "Febre Amarela",
      hepatitisB: "Hepatite B",
      mmr: "Tríplice Viral",
      td: "Tétano e Difteria (dT)",
    },
    categories: {
      adult: "Categoria Adulto",
      travel: "Categoria Viagem",
      infant: "Categoria Infantil",
      booster: "Reforço 10 anos",
    },

    // Add Vaccine View
    registerVaccine: "Registrar Vacina",
    addVaccineSubtitle:
      "Adicione uma nova dose ao seu histórico médico para manter sua proteção sempre atualizada e segura.",
    vaccineName: "Nome da Vacina",
    vaccinePlaceholder: "Ex: Influenza, COVID-19, Hepatite B...",
    doseDate: "Data da Dose",
    lotNumber: "Lote",
    optional: "opcional",
    applicationLocation: "Local de Aplicação",
    locationPlaceholder: "Ex: UBS Santa Maria, Farmácia Popular...",
    locationTip:
      "Dica: Use o nome oficial do posto de saúde ou clínica para melhor rastreio.",
    secureRegistry: "Registro Seguro",
    secureRegistryDesc:
      "Suas informações de saúde são criptografadas e utilizadas apenas para o seu controle pessoal de imunização.",
    saveRegistry: "Salvar Registro",
    forgotDate: "Esqueceu a data?",
    forgotDateDesc:
      "Você pode consultar sua Carteira de Vacinação física para encontrar as datas exatas e o número do lote.",
    boosterReminder: "Lembrete de Reforço",
    boosterReminderDesc:
      "Ao salvar, o Clinical Sanctuary calculará automaticamente a data da sua próxima dose de reforço, se aplicável.",

    // Publish Contract View
    publishContract: "Publicar Contrato",
    publishContractSubtitle:
      "Faça o deploy de um novo contrato VaxZk na rede do Midnight.",
    contractName: "Nome do Contrato",
    contractNamePlaceholder: "Ex: VaxZk Core v1.0",
    network: "Rede",
    networkTestnet: "Testnet",
    networkDevnet: "Devnet",
    deploying: "Publicando...",
    deployContractButton: "Publicar Contrato",
    deploySuccess: "Contrato publicado com sucesso!",
    adminKey: "Admin Inicial (Opcional)",
    adminKeyPlaceholder: "Deixe vazio para usar a carteira atual",
    contractParamsTitle: "Parâmetros do Contrato",
    contractDesc:
      "O construtor definirá automaticamente sua carteira como admin inicial. Outras clínicas poderão ser adicionadas depois.",

    // Deploy Contract View
    deployContract: "Publicar Contrato",
    deployContractSubtitle:
      "Faça o deploy de um novo contrato VaxZk na rede do Midnight.",

    // Vaccines Admin
    manage: "Gerenciar",
    vaccinesAdminTitleEnd: "Vacinas",
    vaccinesAdminSubtitle: "Liste e adicione novas vacinas ao sistema.",
    vaccinesList: "Vacinas Cadastradas",
    add: "Adicionar",
    loading: "Processando...",

    // Manage Access
    accessAdminTitleEnd: "Acessos",
    accessAdminSubtitle: "Gerencie as permissoes dos usuarios",
    accessAddAdminTitle: "Adicionar um novo Admin",
    accessAddAdminLink: "Criar link de convite",
    accessAddAdminDesc:
      "Crie um link de convite e envie para o usuario se tornar admin.",
    accessAddClinicTitle: "Adicionar uma nova Clínica",
    accessAddAClinicLink: "Criar link de convite",
    accessAddClinicDesc:
      "Crie um link de convite e envie para o usuário se tornar uma clínica.",
    removeAccess: "Remover meu acesso de admin",

    // List Clinics View
    listClinicsTitle: "Lista de Clínicas",
    listClinicsSubtitle:
      "Encontre centros de vacinacao autorizados perto de voce",
    registeredClinics: "Clinicas Cadastradas",
    searchClinics: "Buscar clinicas...",
    authorizedCenter: "Centro de Vacinacao Autorizado",
    verifiedProvider: "Prestador Verificado",
    noClinicsFound: "Nenhuma clinica encontrada",
    tryDifferentSearch: "Tente um termo de busca diferente",
    noClinicsRegistered: "Nenhuma clinica foi cadastrada ainda",
    needHelpFinding: "Precisa de ajuda para encontrar uma clinica?",
    contactLocalHealth:
      "Entre em contato com a autoridade de saude local para informacoes atualizadas sobre centros de vacinacao.",

    // Shared UI
    cancel: "Cancelar",
    online: "Online",
    unnamed: "Sem nome",
    coordinates: "Coordenadas:",
    issuerLabel: "Emissor:",
    noIssuerRegistered: "Nenhum emissor registrado",
    reqIdLabel: "ID Req:",
    errConnectContract: "Falha ao conectar ao contrato",

    // Access Admin
    inviteLinkCreated: "Link de convite criado!",
    inviteLinkStoredDesc: "Compartilhe este link com segurança com o destinatário.",
    copyLink: "Copiar link",
    removeAdminTitle: "Remover meu acesso de admin",
    removeAdminDesc: "Remova suas permissões de admin da blockchain. Esta ação não pode ser desfeita.",
    adminAccessRemoved: "Acesso de admin removido com sucesso!",
    errCreateInvite: "Erro ao criar convite: ",
    errRemoveAdmin: "Erro ao remover admin: ",

    // Deploy Contract
    deploySuccessDesc: "Este endereço está salvo no seu navegador. Todas as visualizações o usarão automaticamente no próximo carregamento.",
    copyAddress: "Copiar endereço",

    // Metrics Admin
    totalVaccinesRegistered: "Total de Vacinas Cadastradas",
    activeAdmins: "Admins Ativos",
    activeVerifierOwners: "Proprietários Ativos",
    totalClinicsMetric: "Total de Clínicas",
    pendingAdminInvites: "Convites de Admin Pendentes",
    pendingVerifierInvites: "Convites de Clínica Pendentes",

    // Issuers Admin
    issuersAdminTitleEnd: "Emissores de Certificado",
    issuersAdminSubtitle: "Cadastre e revise as organizações autorizadas a emitir certificados de vacinação.",
    addIssuer: "Adicionar Emissor",
    addingIssuer: "Adicionando Emissor...",
    vaccinationCertIssuers: "Emissores de Certificado de Vacinação",
    loadingIssuers: "Carregando emissores...",
    noIssuersRegistered: "Nenhum emissor cadastrado ainda.",
    addCertIssuerTitle: "Adicionar Emissor de Certificado",
    addIssuerInfo: "Para registrar um emissor de certificado, entre em contato com o provedor/emissor do certificado de vacina para obter os detalhes (nome, URI do serviço, endpoint de verificação e chave pública).",
    issuerName: "Nome do Emissor",
    issuerUri: "URI do Emissor",
    verificationEndpoint: "Endpoint de Verificação",
    verificationEndpointDesc: "URL usada por agentes ou pessoal administrativo para verificar a autenticidade de um certificado de vacinação.",
    publicKey: "Chave Pública",
    issuerNamePlaceholder: "Ex: Autoridade Nacional de Saúde",
    issuerUriPlaceholder: "Ex: https://emissor.exemplo.com",
    issuerVerifEndpointPlaceholder: "Ex: https://emissor.exemplo.com/verificar",
    issuerKeyPlaceholder: "Chave pública fornecida pelo emissor",
    issuerShieldedId: "ID Blindado do Emissor:",
    signaturePubKey: "Chave Pública de Assinatura:",
    uriLabel: "URI:",
    verificationEndpointLabel: "Endpoint de Verificação:",

    // Clinics Admin
    clinicsTitleEnd: "Clínicas",
    manageClinicsSubtitle: "Cadastre suas clínicas na blockchain e veja todas as clínicas registradas.",
    registerNewClinic: "Registrar Nova Clínica",
    clinicName: "Nome da Clínica",
    clinicAddress: "Endereço",
    latitude: "Latitude",
    longitude: "Longitude",
    clinicNamePlaceholder: "Ex: UBS Centro de Saúde",
    addressPlaceholder: "Ex: Rua Principal, 123, São Paulo",
    latitudePlaceholder: "Ex: -23.5990263",
    longitudePlaceholder: "Ex: -46.6419712",
    onlineClinic: "Clínica online (oferece serviços remotos/telesaúde)",
    registering: "Registrando...",
    registerClinic: "Registrar Clínica",
    loadingClinics: "Carregando clínicas...",
    noClinicsOnChain: "Nenhuma clínica cadastrada na blockchain ainda.",
    clinicShieldedId: "ID Blindado da Clínica:",
    ownerShieldedId: "ID Blindado do Proprietário:",

    // Vaccine Proof Requests
    vaccineProofRequests: "Solicitações de Prova de Vacina",
    newRequest: "Nova Solicitação",
    loadingProofRequests: "Carregando solicitações de prova...",
    noProofRequestsYet: "Nenhuma solicitação de prova na blockchain ainda.",
    submitted: "Enviada",
    newVaccineProofRequest: "Nova Solicitação de Prova de Vacina",
    vaccineLabel: "Vacina",
    loadingVaccines: "Carregando vacinas...",
    noVaccinesRegistered: "Nenhuma vacina cadastrada",
    selectVaccine: "Selecione uma vacina...",
    patientId: "ID do Paciente",
    validUntilLabel: "Válido Até",
    requesting: "Solicitando...",
    requestVaccineProofBtn: "Solicitar Prova de Vacina",
    errRequestVaccineProof: "Falha ao solicitar prova de vacina: ",
    patientIdPlaceholder: "Ex: PASSAPORTE-001",

    // User Proof Requests View
    myProofsTitleStart: "Minhas",
    myProofsTitleEnd: "Provas de Vacina",
    vaccineProofsSubtitle: "Veja e envie suas solicitações de prova de vacina.",
    submitting: "Enviando…",
    submitProof: "Enviar Prova",
    errNoIssuerFound: "Nenhum emissor registrado encontrado.",
    errSubmitProof: "Falha ao enviar prova: ",

    // Bottom Nav
    navMyProofs: "Minhas Provas",
    navClinics: "Clínicas",
    navVaccines: "Vacinas",
    navProfile: "Perfil",
    navMetrics: "Métricas",
    navAccess: "Acesso",
    navIssuers: "Emissores",
  },
  es: {
    // Login
    tagline: "Tu pasaporte de inmunización, siempre contigo.",
    privacyNote:
      "Tus datos clínicos están cifrados y almacenados en la blockchain usando",
    privacyNote2: "para garantizar total privacidad.",
    connecting: "Conectando...",
    connected: "Conectado",
    connectButton: "Entrar con Midnight",
    secureConnection: "Conexión Segura y Anonimizada",
    learnMore: "Más sobre Midnight",
    needHelp: "¿Necesitas ayuda?",
    walletNotFound:
      "Midnight Connector (Lace) no encontrado. Por favor, instala la extensión.",
    shieldedAddressNotFound: "Dirección blindada no encontrada.",
    connectionFailed: "Error al conectar con la billetera.",

    // Dashboard header
    loggedInAs: "Conectado como",
    logout: "Salir",

    // Welcome section
    welcomeBack: "Bienvenido de nuevo",
    headline: "Tu salud en\nperfecta armonía.",
    overallStatus: "Estado General",
    immunized: "92% Inmunizado",

    // Next vaccine card
    nextDose: "Próxima Dosis",
    nextVaccineName: "Refuerzo Influenza 2024",
    nextVaccineDesc:
      "Tu dosis anual está disponible para agendar. Mantén tu protección al día.",
    scheduleNow: "Agendar ahora",
    viewDetails: "Ver detalles",

    // Progress
    progress: "Progreso",
    infantCycle: "Ciclo Infantil",
    completed: "Completado",
    boosterDoses: "Dosis de Refuerzo",
    outOf4: "3 de 4",
    internationalTravel: "Viajes Internacionales",
    pending: "Pendiente",

    // Recent history
    recentHistory: "Historial Reciente",
    viewAll: "Ver todo",
    validated: "Validada",
    activities: [
      {
        title: "COVID-19 Bivalente",
        subtitle: "Dosis Única • Unidad Central",
        date: "12 Mar, 2024",
        icon: "shield",
      },
      {
        title: "Hepatitis B",
        subtitle: "3ª Dosis • Clínica Santa Fé",
        date: "15 Ene, 2024",
        icon: "water_drop",
      },
      {
        title: "Fiebre Amarilla",
        subtitle: "Dosis de Refuerzo • Puesto Móvil",
        date: "05 Dic, 2023",
        icon: "science",
      },
    ],

    // Info cards
    nearestClinic: "Clínica más cercana",
    nearestClinicDesc:
      "Unidad Central - 0.8km de distancia. Abierto hasta las 20:00.",
    viewOnMap: "Ver en el mapa",
    familyGroup: "Grupo Familiar",
    familyGroupDesc:
      "Tus dependientes (2) están al día con su calendario. ¡Buen trabajo!",
    manageFamily: "Gestionar familia",

    // Wallet view
    vaccinationWallet: "Cartera de Vacunación",
    walletSubtitle:
      "Siga su historial de inmunización con precisión clínica e total seguridad.",
    filterAll: "Todas",
    filterInfant: "Infantil",
    filterAdult: "Adulto",
    filterTravel: "Viaje",
    latestUpdate: "Última Actualización",
    covidBooster: "Refuerzo COVID-19",
    bivalentDose: "Dosis Bivalente - Protección completa contra variantes.",
    lastUpdateDate: "14 de Octubre, 2023",
    completedStatus: "COMPLETADO",
    vaccines: {
      influenza: "Gripe (Influenza)",
      yellowFever: "Fiebre Amarilla",
      hepatitisB: "Hepatitis B",
      mmr: "Triple Viral",
      td: "Tétano y Difteria (dT)",
    },
    categories: {
      adult: "Categoría Adulto",
      travel: "Categoría Viaje",
      infant: "Categoría Infantil",
      booster: "Refuerzo 10 años",
    },
    // Add Vaccine View
    registerVaccine: "Registrar Vacuna",
    addVaccineSubtitle:
      "Agregue una nueva dosis a su historial médico para mantener su protección siempre actualizada y segura.",
    vaccineName: "Nombre de la Vacuna",
    vaccinePlaceholder: "Ej: Influenza, COVID-19, Hepatitis B...",
    doseDate: "Fecha de la Dosis",
    lotNumber: "Lote",
    optional: "opcional",
    applicationLocation: "Lugar de Aplicación",
    locationPlaceholder: "Ej: Clínica Central, Farmacia Popular...",
    locationTip:
      "Consejo: Use el nombre oficial del centro de salud o clínica para un mejor seguimiento.",
    secureRegistry: "Registro Seguro",
    secureRegistryDesc:
      "Su información de salud está cifrada y se utiliza únicamente para su control personal de inmunización.",
    saveRegistry: "Guardar Registro",
    forgotDate: "¿Olvidó la fecha?",
    forgotDateDesc:
      "Puede consultar su Carnet de Vacunación físico para encontrar las fechas exactas y el número de lote.",
    boosterReminder: "Recordatorio de Refuerzo",
    boosterReminderDesc:
      "Al guardar, Clinical Sanctuary calculará automáticamente la fecha de su próxima dosis de refuerzo, si corresponde.",

    // Publish Contract View
    publishContract: "Publicar Contrato",
    publishContractSubtitle:
      "Despliegue un nuevo contrato inteligente VaxZk en la red de Midnight.",
    contractName: "Nombre del Contrato",
    contractNamePlaceholder: "Ej: VaxZk Core v1.0",
    network: "Red",
    networkTestnet: "Testnet",
    networkDevnet: "Devnet",
    deploying: "Desplegando...",
    deployContractButton: "Desplegar Contrato",
    deploySuccess: "¡Contrato desplegado con éxito!",
    adminKey: "Admin Inicial (Opcional)",
    adminKeyPlaceholder: "Dejar vacío para usar la billetera actual",
    contractParamsTitle: "Parámetros del Contrato",
    contractDesc:
      "El constructor establecerá automáticamente su billetera como administrador inicial. Se pueden agregar más clínicas posteriormente.",

    // Deploy Contract View
    deployContract: "Publicar Contrato",
    deployContractSubtitle:
      "Despliegue un nuevo contrato inteligente VaxZk en la red de Midnight.",

    // Vaccines Admin
    manage: "Administrar",
    vaccinesAdminTitleEnd: "Vacunas",
    vaccinesAdminSubtitle: "Listar y agregar nuevas vacunas al sistema.",
    vaccinesList: "Vacunas Registradas",
    add: "Agregar",
    loading: "Procesando...",

    // Manage Access
    accessAdminTitleEnd: "Accesos",
    accessAdminSubtitle: "Gestionar permisos de usuario",
    accessAddAdminTitle: "Agregar un nuevo Admin",
    accessAddAdminLink: "Crear enlace de invitación",
    accessAddAdminDesc:
      "Crea un enlace de invitación y envíalo al usuario para que se convierta en administrador.",
    accessAddClinicTitle: "Agregar una nueva Clínica",
    accessAddAClinicLink: "Crear enlace de invitación",
    accessAddClinicDesc:
      "Crea un enlace de invitación y envíalo al usuario para que se convierta en clínica.",
    removeAccess: "Retira mi acceso de administrador",

    // List Clinics View
    listClinicsTitle: "Lista de Clínicas",
    listClinicsSubtitle:
      "Encuentra centros de vacunacion autorizados cerca de ti",
    registeredClinics: "Clínicas Registradas",
    searchClinics: "Buscar clínicas...",
    authorizedCenter: "Centro de Vacunación Autorizado",
    verifiedProvider: "Proveedor Verificado",
    noClinicsFound: "No se encontraron clínicas",
    tryDifferentSearch: "Intenta con otro término de búsqueda",
    noClinicsRegistered: "Aún no hay clínicas registradas",
    needHelpFinding: "¿Necesitas ayuda para encontrar una clínica?",
    contactLocalHealth:
      "Contacta a tu autoridad de salud local para obtener información actualizada sobre los centros de vacunación.",

    // Shared UI
    cancel: "Cancelar",
    online: "En línea",
    unnamed: "Sin nombre",
    coordinates: "Coordenadas:",
    issuerLabel: "Emisor:",
    noIssuerRegistered: "Ningún emisor registrado",
    reqIdLabel: "ID Sol:",
    errConnectContract: "Error al conectar con el contrato",

    // Access Admin
    inviteLinkCreated: "¡Enlace de invitación creado!",
    inviteLinkStoredDesc: "Comparta este enlace de forma segura con el destinatario.",
    copyLink: "Copiar enlace",
    removeAdminTitle: "Retirar mi acceso de administrador",
    removeAdminDesc: "Elimina tus permisos de administrador de la blockchain. Esta acción no se puede deshacer.",
    adminAccessRemoved: "¡Acceso de administrador eliminado con éxito!",
    errCreateInvite: "Error al crear invitación: ",
    errRemoveAdmin: "Error al eliminar administrador: ",

    // Deploy Contract
    deploySuccessDesc: "Esta dirección está guardada en su navegador. Todas las vistas la usarán automáticamente en la próxima carga.",
    copyAddress: "Copiar dirección",

    // Metrics Admin
    totalVaccinesRegistered: "Total de Vacunas Registradas",
    activeAdmins: "Admins Activos",
    activeVerifierOwners: "Propietarios Activos",
    totalClinicsMetric: "Total de Clínicas",
    pendingAdminInvites: "Invitaciones de Admin Pendientes",
    pendingVerifierInvites: "Invitaciones de Clínica Pendientes",

    // Issuers Admin
    issuersAdminTitleEnd: "Emisores de Certificado",
    issuersAdminSubtitle: "Registre y revise las organizaciones autorizadas para emitir certificados de vacunación.",
    addIssuer: "Agregar Emisor",
    addingIssuer: "Agregando Emisor...",
    vaccinationCertIssuers: "Emisores de Certificado de Vacunación",
    loadingIssuers: "Cargando emisores...",
    noIssuersRegistered: "Aún no hay emisores registrados.",
    addCertIssuerTitle: "Agregar Emisor de Certificado",
    addIssuerInfo: "Para registrar un emisor de certificado, contacte al proveedor/emisor del certificado de vacuna para obtener sus datos (nombre, URI del servicio, endpoint de verificación y clave pública).",
    issuerName: "Nombre del Emisor",
    issuerUri: "URI del Emisor",
    verificationEndpoint: "Endpoint de Verificación",
    verificationEndpointDesc: "URL utilizada por agentes o personal administrativo para verificar la autenticidad de un certificado de vacunación.",
    publicKey: "Clave Pública",
    issuerNamePlaceholder: "Ej: Autoridad Nacional de Salud",
    issuerUriPlaceholder: "Ej: https://emisor.ejemplo.com",
    issuerVerifEndpointPlaceholder: "Ej: https://emisor.ejemplo.com/verificar",
    issuerKeyPlaceholder: "Clave pública proporcionada por el emisor",
    issuerShieldedId: "ID Blindado del Emisor:",
    signaturePubKey: "Clave Pública de Firma:",
    uriLabel: "URI:",
    verificationEndpointLabel: "Endpoint de Verificación:",

    // Clinics Admin
    clinicsTitleEnd: "Clínicas",
    manageClinicsSubtitle: "Registre sus clínicas en la blockchain y vea todas las clínicas actualmente registradas.",
    registerNewClinic: "Registrar Nueva Clínica",
    clinicName: "Nombre de la Clínica",
    clinicAddress: "Dirección",
    latitude: "Latitud",
    longitude: "Longitud",
    clinicNamePlaceholder: "Ej: Clínica de Salud Ciudad",
    addressPlaceholder: "Ej: Calle Principal 123, Ciudad",
    latitudePlaceholder: "Ej: -23.5990263",
    longitudePlaceholder: "Ej: -46.6419712",
    onlineClinic: "Clínica en línea (ofrece servicios remotos/telesalud)",
    registering: "Registrando...",
    registerClinic: "Registrar Clínica",
    loadingClinics: "Cargando clínicas...",
    noClinicsOnChain: "Aún no hay clínicas registradas en la blockchain.",
    clinicShieldedId: "ID Blindado de la Clínica:",
    ownerShieldedId: "ID Blindado del Propietario:",

    // Vaccine Proof Requests
    vaccineProofRequests: "Solicitudes de Prueba de Vacuna",
    newRequest: "Nueva Solicitud",
    loadingProofRequests: "Cargando solicitudes de prueba...",
    noProofRequestsYet: "Aún no hay solicitudes de prueba en la blockchain.",
    submitted: "Enviada",
    newVaccineProofRequest: "Nueva Solicitud de Prueba de Vacuna",
    vaccineLabel: "Vacuna",
    loadingVaccines: "Cargando vacunas...",
    noVaccinesRegistered: "No hay vacunas registradas",
    selectVaccine: "Seleccione una vacuna...",
    patientId: "ID del Paciente",
    validUntilLabel: "Válido Hasta",
    requesting: "Solicitando...",
    requestVaccineProofBtn: "Solicitar Prueba de Vacuna",
    errRequestVaccineProof: "Error al solicitar prueba de vacuna: ",
    patientIdPlaceholder: "Ej: PASAPORTE-001",

    // User Proof Requests View
    myProofsTitleStart: "Mis",
    myProofsTitleEnd: "Pruebas de Vacuna",
    vaccineProofsSubtitle: "Vea y envíe sus solicitudes de prueba de vacuna.",
    submitting: "Enviando…",
    submitProof: "Enviar Prueba",
    errNoIssuerFound: "No se encontró ningún emisor registrado.",
    errSubmitProof: "Error al enviar prueba: ",

    // Bottom Nav
    navMyProofs: "Mis Pruebas",
    navClinics: "Clínicas",
    navVaccines: "Vacunas",
    navProfile: "Perfil",
    navMetrics: "Métricas",
    navAccess: "Acceso",
    navIssuers: "Emisores",
  },
};

export type Translations = typeof translations.en;
