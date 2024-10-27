import { UploadedFile } from "./uploaded-file";

export interface Users {
    email:string,
    name: string,
    companyName: string,
    phoneNumber:string,
    taxNumber:string,
    country:string,
    zipCode: number,
    site:string,
    files:{ [key: string]: UploadedFile };
}