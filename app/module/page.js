import { cookies } from "next/headers";
import AddModuleForm from "./(add)/AddModuleForm";
import { deleteData, getData, postData, updateData } from "../_lib/api";
import DynamicTable from "../_components/reusable/DynamicTable";
import RemoveCookie from "../_components/reusable/RemoveCookie";
import { SquarePen, Trash2 } from "lucide-react";
import { revalidatePath } from "next/cache";
import { notFound } from "next/navigation";
import Link from "next/link";

export default async function Users() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  async function moduleAddAction(data) {
    "use server";
    const result = await postData("/module", data, token);
    if (result.statusCode === 401)
      return <RemoveCookie message={result.message} />;
    return result;
  }

  async function moduleDeleteAction(data) {
    "use server";
    const result = await deleteData(`/module/${data?.id}`, token);
    if (result.statusCode === 401)
      return <RemoveCookie message={result.message} />;
    if (result.success) revalidatePath("/module");
    return result;
  }

  async function moduleUpdateAction(data) {
    "use server";
    const result = await updateData(`/module/${data.id}`, data, token);
    if (result.statusCode === 401)
      return <RemoveCookie message={result.message} />;
    return result;
  }

  async function moduleGetAction() {
    "use server";
    const result = await getData(`/module`, token);
    return result;
  }

  const res = await getData("/module", token);

  if (res?.statusCode === 401) {
    return <RemoveCookie message={res.message} />;
  }

  // const actions = [
  //   {
  //     label: "Delete",
  //     functionRef: moduleDeleteAction,
  //     icon: (
  //       <Trash2
  //         size={18}
  //         className="text-red-600 dark:text-gray-400 dark:hover:text-red-600"
  //       />
  //     ),
  //   },
  //   {
  //     label: "Update",
  //     functionRef: moduleUpdateAction,
  //     icon: (
  //       <SquarePen
  //         size={18}
  //         className="text-blue-600 dark:text-gray-400 dark:hover:text-blue-600"
  //       />
  //     ),
  //   },
  // ];

  return (
    <div className="p-6 mx-auto">
      <div className="flex flex-wrap justify-between items-center mb-4 gap-4">
           <h1 className="text-2xl text-black dark:text-gray-100 font-bold">
          Module List
        </h1>
        <AddModuleForm moduleAddAction={moduleAddAction} />
      </div>

      <div className="p-6 mx-auto">
        <div className={`overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]`}>
          <div className="max-w-full overflow-x-auto">
            <div className="min-w-[1102px] font-outfit text-sm">
              {/* <div className="overflow-x-auto bg-white rounded-2xl shadow-sm border border-gray-200"> */}
              <table className="min-w-full">
                <thead className="border-b border-gray-100 dark:border-white/[0.05]">
                  <tr>
                    <th className="px-5 py-3 font-medium text-gray-500 text-theme-xs dark:text-gray-400 text-center">
                      No
                    </th>
                    <th className="px-5 py-3 font-medium text-gray-500 text-theme-xs dark:text-gray-400 text-center">
                      Module Name
                    </th>
                    <th className="px-5 py-3 font-medium text-gray-500 text-theme-xs dark:text-gray-400 text-center">
                      Module URL
                    </th>
                    <th className="px-5 py-3 font-medium text-gray-500 text-theme-xs dark:text-gray-400 text-center">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {res?.data?.length > 0 ? (
                    res.data.map((module,index) => (
                      <tr key={module.id} className="">
                        <td className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400 text-center">
                          {index}
                        </td>
                        <td className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400 text-center">
                          {module.module_name}
                        </td>
                        <td className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400 text-center">
                          {module.module_url}
                        </td>
                        <td className="px-5 py-3 font-medium text-gray-500 dark:text-gray-400 text-center">
                          <div className="flex flex-wrap gap-4 justify-center">
                            <Link
                              href={`/module/${module.id}`}
                              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                            >
                              <SquarePen
                                size={18}
                                className="text-blue-600 dark:text-gray-400 dark:hover:text-blue-600"
                              />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <p className="text-gray-400 italic">
                      No permissions available
                    </p>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
