// schema.prisma
datasource db {
    provider = "postgresql"
    url      = env("DATABASE_URL")
}

generator client {
    provider = "prisma-client-js"
}

enum AccountType {
    BANK
    WALLET
    CASH
    CREDIT_CARD
}

enum TransactionType {
    INCOME
    EXPENSE
    TRANSFER
    INVESTMENT
}

enum TransactionStatus {
    PENDING
    COMPLETED
    FAILED
}

enum CategoryType {
    INCOME
    EXPENSE
    TRANSFER
    INVESTMENT
}

enum RecurringFrequency {
    DAILY
    WEEKLY
    MONTHLY
    YEARLY
}

enum UserRole {
    USER
    ADMIN
}

enum Currency {
    INR
    USD
}

enum PaymentMethod {
    UPI
    CASH
    CARD
    ONLINE
    OTHER
}

model User {
    id        String   @id @default(uuid())
    email     String   @unique
    name      String?
    role      UserRole @default(USER)
    createdAt DateTime @default(now())
    updatedAt DateTime @updatedAt

    accounts       Account[]
    transactions   Transaction[]
    categories     Category[]
    subCategories  SubCategory[]
    budgets        Budget[]
    recurringTrans RecurringTransaction[]
    preferences    UserPreference?
}

model Category {
    id        String       @id @default(uuid())
    name      String
    type      CategoryType
    color     String?
    icon      String?
    user      User?        @relation(fields: [userId], references: [id])
    userId    String?
    createdAt DateTime     @default(now())
    updatedAt DateTime     @updatedAt

    subCategories         SubCategory[]
    transactions          Transaction[]
    budgets               Budget[]
    recurringTransactions RecurringTransaction[]

    @@index([userId])
}

model SubCategory {
    id         String   @id @default(uuid())
    name       String
    color      String?
    icon       String?
    user       User?    @relation(fields: [userId], references: [id])
    userId     String?
    category   Category @relation(fields: [categoryId], references: [id])
    categoryId String
    createdAt  DateTime @default(now())
    updatedAt  DateTime @updatedAt

    transactions Transaction[]

    @@index([categoryId, userId])
}

model Account {
    id          String      @id @default(uuid())
    name        String
    type        AccountType
    currency    Currency
    isActive    Boolean     @default(true)
    balance     Decimal     @default(0.0) @db.Decimal(65, 4)
    ifscCode    String?
    branch      String?
    bankId      String?
    bankAccount String?
    isPrimary   Boolean     @default(false)

    user      User     @relation(fields: [userId], references: [id])
    userId    String
    createdAt DateTime @default(now())
    updatedAt DateTime @updatedAt

    transactions    Transaction[]
    accountBalances AccountBalance[]

    @@index([userId])
}

model Transaction {
    id          String            @id @default(uuid())
    amount      Decimal           @db.Decimal(65, 4)
    currency    Currency
    type        TransactionType
    status      TransactionStatus @default(PENDING)
    date        DateTime
    description String?
    comments    String?
    isActive    Boolean           @default(true)
    createdAt   DateTime          @default(now())
    updatedAt   DateTime          @updatedAt

    user   User   @relation(fields: [userId], references: [id])
    userId String

    account   Account @relation(fields: [accountId], references: [id])
    accountId String

    category   Category? @relation(fields: [categoryId], references: [id])
    categoryId String?

    subCategory   SubCategory? @relation(fields: [subCategoryId], references: [id])
    subCategoryId String?

    recurringTransaction   RecurringTransaction? @relation(fields: [recurringTransactionId], references: [id])
    recurringTransactionId String?

    paymentMethod PaymentMethod?
    externalId    String? // for bank import linking

    budget   Budget? @relation(fields: [budgetId], references: [id])
    budgetId String?

    @@index([userId])
    @@index([accountId])
    @@index([categoryId])
    @@index([date])
}

model AccountBalance {
    id              String   @id @default(uuid())
    account         Account  @relation(fields: [accountId], references: [id])
    accountId       String
    date            DateTime
    totalDeposit    Decimal  @default(0.0) @db.Decimal(65, 4)
    totalWithdrawal Decimal  @default(0.0) @db.Decimal(65, 4)
    currentBalance  Decimal  @db.Decimal(65, 4)
    bankId          String?
    bankAccount     String?
    createdAt       DateTime @default(now())
    updatedAt       DateTime @updatedAt

    @@index([accountId, date])
}

model Budget {
    id               String  @id @default(uuid())
    amount           Decimal @db.Decimal(65, 4)
    month            Int? // numeric month (1-12) or use startDate/endDate
    description      String?
    totalDeposits    Decimal @default(0.0) @db.Decimal(65, 4)
    totalWithdrawals Decimal @default(0.0) @db.Decimal(65, 4)

    user       User      @relation(fields: [userId], references: [id])
    userId     String
    category   Category? @relation(fields: [categoryId], references: [id])
    categoryId String?
    createdAt  DateTime  @default(now())
    updatedAt  DateTime  @updatedAt

    transactions Transaction[]

    @@index([userId, categoryId])
}

model RecurringTransaction {
    id            String             @id @default(uuid())
    amount        Decimal            @db.Decimal(65, 4)
    frequency     RecurringFrequency
    description   String?
    startDate     DateTime
    endDate       DateTime?
    status        TransactionStatus  @default(PENDING)
    lastProcessed DateTime?
    user          User               @relation(fields: [userId], references: [id])
    userId        String
    category      Category?          @relation(fields: [categoryId], references: [id])
    categoryId    String?
    isActive      Boolean            @default(true)
    createdAt     DateTime           @default(now())
    updatedAt     DateTime           @updatedAt

    transactions Transaction[] // generated instances of recurring runs

    @@index([userId, frequency])
}

model UserPreference {
    id                 String   @id @default(uuid())
    user               User     @relation(fields: [userId], references: [id])
    userId             String   @unique
    currency           Currency @default(INR)
    dateFormat         String? // e.g., "DD/MM/YYYY"
    theme              String? // "light" | "dark" | custom
    defaultAccountId   String? // optional FK to Account (not enforced) - stored as id
    defaultCategoryId  String? // optional FK to Category
    emailNotifications Boolean  @default(true)
    budgetAlerts       Boolean  @default(true)
    createdAt          DateTime @default(now())
    updatedAt          DateTime @updatedAt

    @@index([userId])
}
