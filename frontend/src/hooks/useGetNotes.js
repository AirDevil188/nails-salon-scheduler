import { useInfiniteQuery } from "@tanstack/react-query";
import useAuthStore from "../stores/useAuthStore";
import api from "../utils/axiosInstance";
import { noteKeys } from "../utils/queryKeys";

export default function useGetNotes(searchQuery, orderBy) {
  const { userInfo } = useAuthStore.getState();
  const { role } = userInfo;

  return useInfiniteQuery({
    queryKey: noteKeys.list({
      type: "infinite",
      role: role,
      search: searchQuery,
      orderBy: orderBy,
    }),

    queryFn: async ({ pageParam }) => {
      if (role === "admin") {
        try {
          const response = await api.get("/api/admin/notes", {
            params: {
              page: pageParam,
              search: searchQuery,
              orderBy: orderBy,
            },
          });
          return response.data;
        } catch (err) {
          console.log("Error inside a queryFn", err);
          throw err;
        }
      } else {
        throw Error("You are not authenticated to do this");
      }
    },
    getNextPageParam: (lastPage, allPages) => {
      const currentPage = lastPage.page;
      const totalPages = lastPage.totalPages;

      // if the currentPage is less than all pages
      if (currentPage < totalPages) {
        return currentPage + 1;
      }

      return undefined;
    },
    staleTime: Infinity,
    cacheTime: 10 * 60 * 1000,
    keepPreviousData: false, // <--- force new data fetch when search changes
  });
}
