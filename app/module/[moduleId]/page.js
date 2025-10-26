import { cookies } from "next/headers";
import { deleteData, getData, postData, updateData } from "../../_lib/api";
import { revalidatePath } from "next/cache";
import RemoveCookie from "@/app/_components/reusable/RemoveCookie";
import RemovePermissionsUI from "../component/RemovePermissionsUI";
import AddPermissionsUI from "../component/AddPermissionsUI";


export default async function ModuleById({ params }) {
  const { id } = params;
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  let abc="Hellow World Frommm Hellowww".replace(/_/g, " ");
  console.log(abc)
  const module_id = (await params)?.moduleId;

  async function moduleDeleteAction(data) {
    "use server";
    const token = (await cookies()).get("token")?.value;
    const result = await deleteData(`/permission/${data.id}`, token);
    console.log(result, "resulttt")
    if (result.statusCode === 401)
      return { success: false, message: "Unauthorized — please log in again." };
    if (result.success) revalidatePath("/module");

    return result;

  }

  async function moduleAddPermissionAction({ permission, moduleId }) {
    "use server";
    const token = (await cookies()).get("token")?.value;
    const result = await postData(`/module/${moduleId}`, { permission }, token); 

    if (result.statusCode === 401) {
      return { success: false, message: "Unauthorized — please login again" };
    }
    
    if (result.success) revalidatePath("/module");
    return result;
  }



  const res = await getData(`/module/${module_id}`, token);

  // console.log(JSON.stringify(res, null, 2), "compo");
  if (res?.statusCode === 401) {
    return <RemoveCookie message={res.message} />;
  }

  if (!res?.data) {
    return (
      <div className="p-6 text-center text-gray-500">Module not found</div>
    );
  }

  const moduleData = res.data;

  return (
    <div className="p-6 mx-auto">
      <div className="flex justify-between align-middle mb-4 ">
        <h3 className="text-2xl text-black dark:text-gray-100 font-bold flex align-middle max-sm:text-[20px]">
          Role Permissions Management
        </h3>
        <AddPermissionsUI moduleId={module_id} moduleAddPermissionAction={moduleAddPermissionAction} />
      </div>
      <div
        className={`overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]`}
      >
        <div className="max-w-full overflow-x-auto">
          <div className="min-w-[1102px] font-outfit text-sm">
            {/* <div className="overflow-x-auto bg-white rounded-2xl shadow-sm border border-gray-200"> */}
            <table className="min-w-full">
              <thead className="border-b border-gray-100 dark:border-white/[0.05]">
                <tr>
                  <th className="px-5 py-3 font-medium text-gray-500 text-theme-xs dark:text-gray-400 text-center">
                    Module Name
                  </th>
                  <th className="px-5 py-3 font-medium text-gray-500 text-theme-xs dark:text-gray-400 text-center">
                    Module URL
                  </th>
                  <th className="px-5 py-3 font-medium text-gray-500 text-theme-xs dark:text-gray-400 text-center">
                    Permissions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {/* {res.data.permissions.map((module) => ( */}
                <tr className="w-[100%]">
                  <td className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400 text-center w-[25%]">
                    {res?.data?.module_name}
                  </td>
                  <td className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400 text-center w-[25%]">
                    {res?.data?.module_url}
                  </td>
                  <td className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400 text-center w-[50%]">
                    <div className="flex flex-wrap gap-4 justify-center">
                      {/* {res.data.permissions?.length > 0 ? (
                        res.data.permissions.map((perm) => {
                          return (
                            <h1>{perm.name}</h1>
                          );
                        })
                      ) : (
                        <p className="text-gray-400 italic">
                          No permissions available
                        </p>
                      )} */}
                      <RemovePermissionsUI
                        permissions={res}
                        moduleDeleteAction={moduleDeleteAction}
                      />
                    </div>
                  </td>
                </tr>
                {/* ))} */}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
