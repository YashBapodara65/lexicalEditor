import PermissionClient from "@/app/_components/client/PermissionClient";
import { getData, postData, updateData } from "@/app/_lib/api";
import { decodeJwt } from "jose";
import { cookies } from "next/headers";
import RemoveCookie from "@/app/_components/reusable/RemoveCookie";
import { notFound } from "next/navigation";

export default async function AddPermission({ params }) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  const role_id = (await params)?.role_id;

  async function permissionAddAction(data) {
    "use server";
    const result = await postData(
      `/permission/${role_id}`,
      { permissions: data },
      token
    );
    if (result.statusCode === 401) return removeCookie();
    // 🚀 force the page to refresh its server data
    return result;
  }

  async function permissionUpdateAction(data, id, oldData=[]) {
    "use server";

    // Merge old + new data
    // If you want to avoid duplicates based on module_id, you can filter them
    const mergedPermissions = [
      ...oldData.filter(
        (oldItem) =>
          !data.some((newItem) => newItem.module_id === oldItem.module_id)
      ),
      ...data,
    ];

    const result = await updateData(
      `/permission/${id}`,
      { permissions: mergedPermissions },
      token
    );

    if (result.statusCode === 401) return removeCookie();
    return result;
  }

  let decoded = null;
  if (token) {
    try {
      decoded = decodeJwt(token);
    } catch (err) {
      decoded = { error: "Invalid JWT" };
    }
  }

  const moduleGetData = await getData(`/module`, token);

  const rolePermissionList = await getData(`/permission/${role_id}`, token);
  if (
    moduleGetData?.statusCode === 401 ||
    rolePermissionList?.statusCode === 401
  ) {
    return <RemoveCookie message={moduleGetData.message} />;
  }

  if (rolePermissionList.statusCode === 404) {
    notFound();
  }

  if (!moduleGetData?.success || !rolePermissionList?.success) {
    return (
      <div className="p-6">
        <h1 className="text-xl font-bold text-red-600">
          {moduleGetData?.message || "Failed to fetch users"}
        </h1>
      </div>
    );
  }

  const roleModuleIds =
    rolePermissionList?.data?.modules?.map?.((r) => r.module_id) ?? [];

  const modulesList = moduleGetData.data
    .filter((module) => !roleModuleIds?.includes(module.id)) // keep only modules not in rolePermissionList
    .map((module) => ({
      module_id: module.id,
      module_url: module.module_url,
      module_name: module.module_name,
      is_read: false,
      is_write: false,
      is_update: false,
      is_delete: false,
      is_reviewer: false,
      is_approver: false, 
    }));

  return (
    <div className="w-full p-4">
      <PermissionClient
        modulesList={modulesList}
        rolePermissionList={rolePermissionList?.data?.modules}
        permissionAddOrUpdateAction={
          rolePermissionList?.data === undefined
            ? permissionAddAction
            : permissionUpdateAction
        }
        permissionId={rolePermissionList?.data?.permission_id}
      />
    </div>
  );
}
