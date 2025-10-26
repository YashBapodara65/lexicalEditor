import PermissionClient from "@/app/_components/client/PermissionClient";
import { deleteData, getData, postData, updateData } from "@/app/_lib/api";
import { decodeJwt } from "jose";
import { cookies } from "next/headers";
import RemoveCookie from "@/app/_components/reusable/RemoveCookie";
import { notFound } from "next/navigation";
import { removeCookie } from "@/app/action";
import PermissionCheckbox from "@/app/_components/client/PermissionCheckbox";
import { UserCircle } from "lucide-react";
import Link from "next/link";

export default async function AddPermission({ params, className = "" }) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  const role_id = (await params)?.role_id;

  console.log(params, "paramas")



  async function togglePermissionAction(permissionId, checked) {
    "use server";

    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    const endpoint = `/permission/role-permission/${role_id}/${permissionId}`;

    let result;
    if (checked) {
      result = await postData(endpoint, {}, token);
    } else {
      result = await deleteData(endpoint, token);
    }

    if (result.statusCode === 401) {
      return {
        success: false,
        message: "Unauthorized. Please login again.",
      };
    }

    return result;
  }

  const rolePermissionList = await getData(`/permission/${role_id}`, token);


  if (rolePermissionList.statusCode === 404) {
    notFound();
  }


  const moduleGetData = await getData(`/module`, token);

  if (moduleGetData.statusCode === 404) {
    notFound();
  }


  console.log(JSON.stringify(rolePermissionList, null, 2), 'rolePermissionList')
  console.log(JSON.stringify(moduleGetData, null, 2), 'moduleGetData')
  if (
    moduleGetData?.statusCode === 401 ||
    rolePermissionList?.statusCode === 401
  ) {
    return <RemoveCookie message={moduleGetData.message} />;
  }


  const modules = moduleGetData?.data || [];
  const rolePermissions = rolePermissionList?.data || [];




  // async function permissionAddAction(data) {
  //   "use server";
  //   const result = await postData(
  //     `/permission/${role_id}`,
  //     { permissions: data },
  //     token
  //   );
  //   if (result.statusCode === 401) return removeCookie();
  //   // 🚀 force the page to refresh its server data
  //   return result;
  // }


  // async function permissionUpdateAction(data, id, oldData = []) {
  //   "use server";

  //   // Merge old + new data
  //   // If you want to avoid duplicates based on module_id, you can filter them
  //   const mergedPermissions = [
  //     ...oldData.filter(
  //       (oldItem) =>
  //         !data.some((newItem) => newItem.module_id === oldItem.module_id)
  //     ),
  //     ...data,
  //   ];

  //   const result = await updateData(
  //     `/permission/${id}`,
  //     { permissions: mergedPermissions },
  //     token
  //   );

  //   if (result.statusCode === 401) return removeCookie();
  //   return result;
  // }

  // let decoded = null;
  // if (token) {
  //   try {
  //     decoded = decodeJwt(token);
  //   } catch (err) {
  //     decoded = { error: "Invalid JWT" };
  //   }
  // }

  // const [moduleGetData, rolePermissionList] = await Promise.all([
  //   getData(`/module`, token),
  //   getData(`/permission/${role_id}`, token),

  // ])



  // if (!moduleGetData?.success || !rolePermissionList?.success) {
  //   return (
  //     <div className="p-6">
  //       <h1 className="text-xl font-bold text-red-600">
  //         {moduleGetData?.message || "Failed to fetch users"}
  //       </h1>
  //     </div>
  //   );
  // }

  // const roleModuleIds =
  //   rolePermissionList?.data?.modules?.map?.((r) => r.module_id) ?? [];

  // const modulesList = moduleGetData.data
  //   .filter((module) => !roleModuleIds?.includes(module.id)) // keep only modules not in rolePermissionList
  //   .map((module) => ({
  //     module_id: module.id,
  //     module_url: module.module_url,
  //     module_name: module.module_name,
  //     is_read: false,
  //     is_write: false,
  //     is_update: false,
  //     is_delete: false,
  //     is_reviewer: false,
  //     is_approver: false, 
  //   }));



  return (
    <div className="p-6 mx-auto">

      {/* <PermissionClient
        modulesList={modulesList}
        rolePermissionList={rolePermissionList?.data?.modules}
        permissionAddOrUpdateAction={
          rolePermissionList?.data === undefined
            ? permissionAddAction
            : permissionUpdateAction
        }
        permissionId={rolePermissionList?.data?.permission_id}
      /> */}

      {/* <h1 className="mb-4 font-bold text-black dark:text-gray-100 text-title-md">
        Role Permissions Management
      </h1> */}

      <div className="flex flex-wrap justify-between items-center mb-4 gap-4">
        <div className="flex items-center gap-3">
          <Link href={"/role-management"} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
            <UserCircle />
          </Link>
          <span className="text-gray-500">/</span>
          <p className="text-2xl text-black dark:text-gray-100 font-bold">
            {rolePermissions.name}
          </p>
        </div>
      </div>

      {/* <PermissionTable modules={modules} rolePermissions={rolePermissions} /> */}

      <div
        className={`overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] ${className}`}
      >
        <div className="max-w-full overflow-x-auto">
          <div className="min-w-[1102px] font-outfit text-sm">
            {/* <div className="overflow-x-auto bg-white rounded-2xl shadow-sm border border-gray-200"> */}
            <table className="min-w-full">
              <thead className="border-b border-gray-100 dark:border-white/[0.05]">
                <tr>
                  <th className="px-5 py-3 font-medium text-gray-500 text-theme-xs dark:text-gray-400 text-center">Module Name</th>
                  <th className="px-5 py-3 font-medium text-gray-500 text-theme-xs dark:text-gray-400 text-center">Module URL</th>
                  <th className="px-5 py-3 font-medium text-gray-500 text-theme-xs dark:text-gray-400 text-center">Permissions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {modules.map((module) => (
                  <tr
                    key={module.id}
                    className=""
                  >
                    <td className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400 text-center">
                      {module.module_name}
                    </td>
                    <td className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400 text-center">
                      {module.module_url}
                    </td>
                    <td className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400 text-center">
                      <div className="flex flex-wrap gap-4 justify-center">
                        {module.permissions?.length > 0 ? (
                          module.permissions.map((perm) => {
                            const isChecked = rolePermissions.permissions.some(
                              (rp) =>
                                rp.permission?.id === perm.id &&
                                rp.permission?.module_id === module.id
                            );
                            return (
                              <PermissionCheckbox
                                key={perm.id}
                                permissionId={perm.id}
                                moduleId={module.id}
                                label={perm.name}
                                defaultChecked={isChecked}
                                toggleAction={togglePermissionAction}
                              />
                            );
                          })
                        ) : (
                          <p className="text-gray-400 italic">
                            No permissions available
                          </p>
                        )}
                      </div>
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








































// import { cookies } from "next/headers";
// import { getData } from "@/app/_lib/api";
// import RemoveCookie from "@/app/_components/reusable/RemoveCookie";
// import { notFound } from "next/navigation";
// import PermissionCheckbox from "@/app/_components/client/PermissionCheckbox";

// export default async function AddPermission({ params }) {
//   const cookieStore = await cookies();
//   const token = cookieStore.get("token")?.value;
//   const role_id = params?.role_id;

//   // ✅ Fetch module list and current role permissions
//   const [moduleGetData, rolePermissionList] = await Promise.all([
//     getData(`/module`, token),
//     getData(`/permission/${role_id}`, token),
//   ]);

//   if (
//     moduleGetData?.statusCode === 401 ||
//     rolePermissionList?.statusCode === 401
//   ) {
//     return <RemoveCookie message={moduleGetData.message} />;
//   }

//   if (moduleGetData.statusCode === 404 || rolePermissionList.statusCode === 404) {
//     notFound();
//   }

//   const modules = moduleGetData?.data || [];
//   const rolePermissions = rolePermissionList?.data || [];

//   // ✅ Define the server action for toggling role permissions
//   async function togglePermissionAction(permissionId, checked) {
//     "use server";

//     const cookieStore = await cookies();
//     const token = cookieStore.get("token")?.value;
//     const baseUrl = process.env.NEXT_PUBLIC_API_URL;

//     const endpoint = `${baseUrl}/role-permission/${role_id}/${permissionId}`;
//     const method = checked ? "POST" : "DELETE";

//     const res = await fetch(endpoint, {
//       method,
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${token}`,
//       },
//     });

//     const data = await res.json();
//     return data;
//   }

//   // ✅ Render the permission table
//   return (
//     <div className="w-full p-6">
//       <h1 className="text-2xl font-semibold text-gray-800 mb-6">
//         Role Permissions Management
//       </h1>

//       <div className="overflow-x-auto bg-white rounded-2xl shadow-sm border border-gray-200">
//         <table className="min-w-full text-sm text-left">
//           <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
//             <tr>
//               <th className="px-4 py-3 w-1/5">Module Name</th>
//               <th className="px-4 py-3 w-1/5">Module URL</th>
//               <th className="px-4 py-3">Permissions</th>
//             </tr>
//           </thead>
//           <tbody>
//             {modules.map((module) => (
//               <tr
//                 key={module.id}
//                 className="border-b hover:bg-gray-50 transition"
//               >
//                 <td className="px-4 py-4 font-medium text-gray-800">
//                   {module.module_name}
//                 </td>
//                 <td className="px-4 py-4 text-gray-600">
//                   {module.module_url}
//                 </td>
//                 <td className="px-4 py-4">
//                   <div className="flex flex-wrap gap-4">
//                     {module.permissions?.length > 0 ? (
//                       module.permissions.map((perm) => {
//                         const isChecked = rolePermissions.some(
//                           (rp) =>
//                             rp.permission?.id === perm.id &&
//                             rp.permission?.module_id === module.id
//                         );

//                         return (
//                           <PermissionCheckbox
//                             key={perm.id}
//                             permissionId={perm.id}
//                             label={perm.name}
//                             defaultChecked={isChecked}
//                             toggleAction={togglePermissionAction}
//                           />
//                         );
//                       })
//                     ) : (
//                       <p className="text-gray-400 italic">
//                         No permissions available
//                       </p>
//                     )}
//                   </div>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }
