import { deleteData, getData, postData, updateData } from "../_lib/api";
import { cookies } from "next/headers";
import RemoveCookie from "../_components/reusable/RemoveCookie";
import { decodeJwt } from "jose";
import { SquarePen, Trash2 } from "lucide-react";
import UserTable from "./(user-table)/page";
import { revalidatePath } from "next/cache";
import Pagination from "../_components/reusable/Pagination";
import { notFound } from "next/navigation";
import UserActions from "./component/UserActions";

export default async function Users({ searchParams }) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  console.log(searchParams, "searchparamsss")

  let decoded = null;
  if (token) {
    try {
      decoded = decodeJwt(token); // Decode only (no signature check)
    } catch (err) {
      decoded = { error: "Invalid JWT" };
    }
  }


  const res = await getData(
    `/user/organization-user`,
    token
  );

  const GetRoles = await getData(
    `/role`,
    token
  );

  console.log(res.data.usersWithRoles, "ressssssss")


  const {
    usersWithRoles = [],
    totalPages = 1,
    total = 0,
    page = 1,
    limit = 10,
  } = res.data;



  async function addUserAction(data) {
    "use server";
    const result = await postData(`/user/register`, data, token);
    if (result.statusCode === 401)
      return <RemoveCookie message={result.message} />;
    if (result.success) revalidatePath("/users");
    return result;
  }

  async function deleteUserAction(data) {
    "use server";
    const result = await deleteData(`/user/${data?.id}`, token);
    if (result.statusCode === 401)
      return <RemoveCookie message={result.message} />;
    if (result.success) revalidatePath("/users");
    return result;
  }

  // async function updateUserAction(data) {
  //   "use server";
  //   const result = await updateData(`/user/${data.id}`, data, token);
  //   if (result.statusCode === 401)
  //     return <RemoveCookie message={result.message} />;
  //   if (result.success) revalidatePath("/users");
  //   return result;
  // }

  async function updateUserAction(data) {
    "use server";
    const result = await updateData(`/user/${data.id}`, data, token);
    if (result.statusCode === 401) {
      return <RemoveCookie message={result.message} />;
    }
    if (result.success) {
      revalidatePath("/users");
    }
    return result;
  }

  async function updateUserRoleAction(data) {
    "use server";
    const { user_id, role_id } = data;

    const result = await postData(`/role/assign-role/${user_id}/${role_id}`, data, token);

    if (result.statusCode === 401)
      return <RemoveCookie message={result.message} />;

    if (result.success) revalidatePath("/users");
    return result;
  }

  // Pagination params
  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);



  // const roles_data = await getData(`/role/${decoded.organization_id}`, token);

  // console.log(roles_data,"rolesDataaa")

  if (res?.statusCode === 401) {
    return <RemoveCookie message={res.message} />;
  }

  if (!res?.success) {
    return notFound();
  }

  // const totalItems = res?.data?.totalPages || res?.data?.usersWithRoles.length;
  // const totalPages = Math.ceil(totalItems / pageSize);

  return (
    <div className="p-6 mx-auto">
      <UserTable
        usersData={res?.data?.usersWithRoles}
        // roles_data={roles_data.data}
        addUserAction={addUserAction}
        // deleteUserAction={deleteUserAction}
        // updateUserAction={updateUserAction}
      />



      {/* User Table */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] mt-4">
        <div className="max-w-full overflow-x-auto">
          <div className="min-w-[1102px] font-outfit text-sm">
            <table className="min-w-full">
              <thead className="border-b border-gray-100 dark:border-white/[0.05]">
                <tr>
                  <th className="px-5 py-3 font-medium text-gray-500 text-theme-xs dark:text-gray-400 text-center">
                    Employee Code
                  </th>
                  <th className="px-5 py-3 font-medium text-gray-500 text-theme-xs dark:text-gray-400 text-center">
                    Name
                  </th>
                  <th className="px-5 py-3 font-medium text-gray-500 text-theme-xs dark:text-gray-400 text-center">
                    Email
                  </th>
                  <th className="px-5 py-3 font-medium text-gray-500 text-theme-xs dark:text-gray-400 text-center">
                    Role
                  </th>
                  <th className="px-5 py-3 font-medium text-gray-500 text-theme-xs dark:text-gray-400 text-center">
                    Status
                  </th>
                  <th className="px-5 py-3 font-medium text-gray-500 text-theme-xs dark:text-gray-400 text-center">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {res?.data?.usersWithRoles.length > 0 ? (
                  res?.data?.usersWithRoles.map((user) => {
                    console.log(user.roles,"userrrr----")
                    return(
                    <tr key={user.id}>
                      <td className="px-5 py-3 text-gray-700 dark:text-gray-300 text-center">
                        {user.employee_code || "-"}
                      </td>
                      <td className="px-5 py-3 text-gray-700 dark:text-gray-300 text-center">
                        {user.name || "-"}
                      </td>
                      <td className="px-5 py-3 text-gray-700 dark:text-gray-300 text-center">
                        {user.email || "-"}
                      </td>
                      <td className="px-5 py-3 text-gray-700 dark:text-gray-300 text-center">
                          {user.roles && user.roles.length > 0
                            ? user.roles.map((r) => r.role?.name).join(", ")
                            : "-"}
                      </td>
                      <td className="px-5 py-3 text-center">
                        <span
                          className={`px-3 py-1 text-xs font-medium rounded-full ${user.is_active
                            ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400"
                            : "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400"
                            }`}
                        >
                          {user.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      {/* <td className="px-5 py-3 flex justify-center gap-3">
                              <button
                                onClick={() => openUpdateModal(user)}
                                className="text-blue-600 hover:text-blue-700 dark:text-gray-400 dark:hover:text-blue-600"
                              >
                                <SquarePen size={18} />
                              </button>
                              <button
                                onClick={() => showConfirmModal(user)}
                                className="text-red-600 hover:text-red-700 dark:text-gray-400 dark:hover:text-red-600"
                              >
                                <Trash2 size={18} />
                              </button>
                            </td> */}


                      <td className="px-4 py-4 flex gap-2 justify-center">
                        <UserActions
                          // role={role}
                          // usersData={res?.data?.usersWithRoles}
                          usersData={user}
                          GetRoles={GetRoles}
                          // roles_data={roles_data.data}
                          // addUserAction={addUserAction}
                          updateUserRoleAction={updateUserRoleAction}
                          updateUserAction={updateUserAction}
                          deleteUserAction={deleteUserAction}
                        // permissionRoleAction={permissionRoleAction}
                        />

                      </td>
                    </tr>)
                  })
                ) : (
                  <tr>
                    <td
                      colSpan="6"
                      className="text-center py-6 text-gray-500 dark:text-gray-400"
                    >
                      No users found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>



      <div
        className={`mt-4 flex items-center ${total >= 10 ? "justify-between" : "justify-end"
          }`}
      >
        {total >= 10 && (
          <h1 className="text-gray-500 dark:text-gray-400 font-bold">
            Showing 1 to {start} of {end} entries
          </h1>
        )}
        <Pagination
          totalPages={totalPages}
          currentPage={page}
          baseUrl="/users" // the page route
        />
      </div>
    </div>
  );
}
