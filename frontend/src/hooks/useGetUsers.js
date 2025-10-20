import { useInfiniteQuery } from "@tanstack/react-query";
import api from "../utils/axiosInstance";
import { userKeys } from "../utils/queryKeys";

export default function useGetUsers(searchQuery, orderBy) {
  return useInfiniteQuery({
    queryKey: userKeys.list("infinite", {
      search: searchQuery,
      orderBy: orderBy,
    }),

    queryFn: async ({ pageParam }) => {
      try {
        const response = await api.get("/api/admin/users", {
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
    cacheTim: 10 * 60 * 1000,
  });
}
