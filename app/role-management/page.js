import { cookies } from "next/headers";
import { deleteData, getData, postData, updateData } from "../_lib/api";
import AddRoleForm from "./(add)/AddRoleForm";
import DynamicTable from "../_components/reusable/DynamicTable";
import { decodeJwt } from "jose";
import RemoveCookie from "../_components/reusable/RemoveCookie";
import { removeCookie } from "../action";
import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";
import { House, KeySquare, SquarePen, Trash2 } from "lucide-react";
import Link from "next/link";
import RoleActionButtons from "./component/RoleActionButtons";

export default async function RolePage({ className = "" }) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  async function roleAddAction(data) {
    "use server";

    const result = await postData("/role", data, token);
    if (result.statusCode === 401) return removeCookie();
    if (result.success) revalidatePath("/role-management");
    return result;
  }

  async function updateRoleAction(data) {
    "use server";
    const result = await updateData(`/role/${data.id}`, data, token);
    if (result.statusCode === 401)
      return <RemoveCookie message={result.message} />;
    if (result.success) revalidatePath("/role-management");
    return result;
  }

  async function deleteRoleAction(data) {
    "use server";
    const result = await deleteData(`/role/${data?.id}`, token);
    if (result.statusCode === 401)
      return <RemoveCookie message={result.message} />;
    if (result.success) revalidatePath("/role-management");
    return result;
  }

  async function permissionRoleAction(row) {
    "use server";
    // redirect(`/role-management/${row.id}`);
    return { success: true, id: row.id }
  }

  // let decoded = null;
  // if (token) {
  //   try {
  //     decoded = decodeJwt(token); // Decode only (no signature check)
  //   } catch (err) {
  //     decoded = { error: "Invalid JWT" };
  //   }
  // }

  const res = await getData("/role", token);

  console.log(res, "res")
  if (res?.statusCode === 401) {
    return <RemoveCookie message={res.message} />;
  }

  if (!res?.success) {
    return notFound();
  }

  // let roles =
  //   res?.data?.map((item) => {
  //     return {
  //       id: item.id,
  //       role_name: item.name,
  //       created_at: item.created_at,
  //       updated_at: item.updated_at,
  //     };
  //   }) || [];

  // const actions = [
  //   {
  //     label: "Update",
  //     functionRef: updateRoleAction,
  //     icon: <SquarePen size={18} className="text-blue-600 dark:text-gray-400 dark:hover:text-blue-600" />,
  //   },
  //   {
  //     label: "Delete",
  //     functionRef: deleteRoleAction,
  //     icon: <Trash2 size={18} className="text-red-600 dark:text-gray-400 dark:hover:text-red-600" />,
  //   },
  //   {
  //     label: "Permission",
  //     functionRef: permissionRoleAction,
  //     icon: <KeySquare size={18} className="text-green-600 dark:text-gray-400 dark:hover:text-green-600" />,
  //   },
  // ];

  return (
    <div className="p-6 mx-auto">
      <div className="flex flex-wrap justify-between items-center mb-4 gap-4">
        <div className="flex items-center gap-3">
          <Link href={"/"} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
            <House />
          </Link>
          <span className="text-gray-500">/</span>
          <h1 className="text-2xl text-black dark:text-gray-100 font-bold">
            Role Management
          </h1>
        </div>
        <AddRoleForm roleAddAction={roleAddAction} />
      </div>
      {/* <DynamicTable
        data={roles}
        entityName="role"
        baseUrl="/role-management"
        actions={actions}
        permissionKeys={["role_name"]} // <-- pass editable fields here
      /> */}



      <div className={`overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] ${className}`}>
        <div className="max-w-full overflow-x-auto">
          <div className="min-w-[1102px] font-outfit text-sm">
            <table className="min-w-full">
              <thead className="border-b border-gray-100 dark:border-white/[0.05]">
                <tr>
                  <th className="px-5 py-3 font-medium text-gray-500 text-theme-xs dark:text-gray-400 text-center">Role Name</th>
                  <th className="px-5 py-3 font-medium text-gray-500 text-theme-xs dark:text-gray-400 text-center">Created At</th>
                  <th className="px-5 py-3 font-medium text-gray-500 text-theme-xs dark:text-gray-400 text-center">Updated At</th>
                  <th className="px-5 py-3 font-medium text-gray-500 text-theme-xs dark:text-gray-400 text-center">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {res?.data?.map((role) => (
                  <tr
                    key={role.id}
                  >
                    <td className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400 text-center">
                      {role.name}
                    </td>
                    <td className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400 text-center">
                      {role.created_at}
                    </td>
                    <td className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400 text-center">
                      {role.updated_at}
                    </td>
                    <td className="px-4 py-4 flex gap-2 justify-center">
                      <RoleActionButtons
                        role={role}
                        updateRoleAction={updateRoleAction}
                        deleteRoleAction={deleteRoleAction}
                        permissionRoleAction={permissionRoleAction}
                      />
                      <Link href={`/role-management/${role.id}`}>
                        <KeySquare size={16} className="text-green-600 dark:text-gray-400 dark:hover:text-green-600" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
