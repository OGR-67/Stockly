import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { recipeService } from "../../services";
import { queryKeys } from "./queryKeys";

export function useRecipes() {
  return useQuery({
    queryKey: queryKeys.recipes,
    queryFn: () => recipeService.getAll(),
  });
}

export function useRecipeMutations() {
  const qc = useQueryClient();
  const invalidate = () =>
    qc.invalidateQueries({ queryKey: queryKeys.recipes });

  const create = useMutation({
    mutationFn: ({
      name,
      type,
      freeText,
      productIds,
    }: {
      name: string;
      type: "main" | "dessert";
      freeText?: string;
      productIds: string[];
    }) => recipeService.create(name, type, freeText, productIds),
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: ({
      id,
      name,
      type,
      freeText,
      productIds,
    }: {
      id: string;
      name: string;
      type: "main" | "dessert";
      freeText?: string;
      productIds: string[];
    }) => recipeService.update(id, name, type, freeText, productIds),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id: string) => recipeService.delete(id),
    onSuccess: invalidate,
  });

  return { create, update, remove };
}
