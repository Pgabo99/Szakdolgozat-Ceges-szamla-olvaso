export enum companyType {
    bt = "Betéti Társaság",
    kft = "Korlátolt Felelősségű Társaság"
}

export interface Bills {
    email: string,
    fajlNev: string,
    szamlaszam: string;
    tipus: string;
    szallitoNev: string;
    szallitoAdo: string,
    szallitoIrsz: number,
    szallitoTelepules: string,
    szallitoCim: string,
    fizKelt: string,
    fizTeljesites: string,
    fizHatarido: string,
    fizMod: string,
    netto: string,
    brutto: string,
    afa: string,
    tartalom: string
}