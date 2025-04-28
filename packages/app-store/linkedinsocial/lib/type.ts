import { PageInfo } from "../../types";


interface Results {
    [key: string]: PageInfo;
}

export interface PageInfoData {
    results: Results;
}

// const jsonData: OrganizationData = /* Your JSON data here */;

// // Extract id and vanityName from each organization
// const organizations: Organization[] = Object.values(jsonData.results).map(org => ({
//     id: org.id,
//     vanityName: org.vanityName
// }));

// // Example usage:
// organizations.forEach(org => {
//     console.log(`ID: ${org.id}, Vanity Name: ${org.vanityName}`);
// });
