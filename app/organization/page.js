import { cookies } from "next/headers";
import { getData, postData } from "../_lib/api";
import AddOrganizationForm from "./(add)/AddOrganizationForm";
import DynamicTable from "../_components/reusable/DynamicTable";
import Pagination from "../_components/reusable/Pagination";
import RemoveCookie from "../_components/reusable/RemoveCookie";
import { removeCookie } from "../action";
import { notFound } from "next/navigation";
import { decodeJwt } from "jose";

export default async function OrganizationPage({ searchParams }) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

    let user = null;
    if (token) {
      try {
        user = decodeJwt(token);
      } catch (err) {
        console.error("Invalid token:", err.message);
      }
    }

  // Server action for adding organization
  async function organizationAddAction(data) {
    "use server";
    const result = await postData("/organization", data, token);
    if (result.statusCode === 401) return removeCookie();
    return result;
  }

  // Pagination params
  const currentPage = parseInt((await searchParams)?.page || "1", 10);
  const pageSize = 10;

  // Fetch organizations
  const res = await getData(`/organization?page=${currentPage}`, token);

  if (res?.statusCode === 401) {
    return <RemoveCookie message={res.message} />;
  }

  if (!user.is_accessible || user.role !== "Super Admin" || res.statusCode === 403 || !res?.success) {
    return notFound();
  }

  const organizations_data = Array.isArray(res?.data?.organizations)
    ? res.data.organizations
    : [];

  const totalItems = res?.data?.recordCount || organizations_data.length;
  const totalPages = Math.ceil(totalItems / pageSize);

  return (
    <div className="p-6 mx-auto">
      <div className="flex flex-wrap justify-between items-center mb-4 gap-4">
        <h1 className="text-2xl text-black dark:text-gray-100 font-bold">
          Organization
        </h1>
        <AddOrganizationForm organizationAddAction={organizationAddAction} />
      </div>

      <DynamicTable
        data={organizations_data}
        entityName="organizations"
        currentPage={currentPage}
        pageSize={pageSize}
      />
       <div className={`mt-4 flex items-center ${totalItems >= 10 ? 'justify-between' : 'justify-end'}`}>
        {
          totalItems >= 10 &&
        <h1 className="text-gray-500 dark:text-gray-400 font-bold">Showing 1 to {pageSize} of {totalItems} entries</h1>
        }
        <Pagination
        totalPages={totalPages}
        currentPage={currentPage}
        baseUrl="/organization" // the page route
      />
      </div>
    </div>
  );
}
