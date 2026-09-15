// import {
//   useMutation,
//   useQuery,
//   useQueryClient,
// } from "@tanstack/react-query";

// import { useTournamentRepository } from "../../../database/hooks/useTournamentRepository";
// import { CreateTournament } from "../../../database/repositories/TournamentRepository";

// export function useTournaments() {
//   const repository = useTournamentRepository();
//   const queryClient = useQueryClient();

//   const { data: tournaments = [], isLoading, isError } = useQuery({
//     queryKey: ["tournaments"],
//     queryFn: () => repository.getAll(),
//   });

//   const { mutateAsync: create } = useMutation({
//     mutationFn: (data: CreateTournament) => repository.create(data),
//     onSuccess: async () => {
//       await queryClient.invalidateQueries({ queryKey: ["tournaments"] });
//     },
//   });

//   const { mutateAsync: update } = useMutation({
//     mutationFn: ({ id, data }: { id: number; data: CreateTournament }) =>
//       repository.update(id, data),
//     onSuccess: async () => {
//       await queryClient.invalidateQueries({ queryKey: ["tournaments"] });
//     },
//   });

//   const { mutateAsync: remove } = useMutation({
//     mutationFn: (id: number) => repository.delete(id),
//     onSuccess: async () => {
//       await queryClient.invalidateQueries({ queryKey: ["tournaments"] });
//     },
//   });

//   return {
//     tournaments,
//     isLoading,
//     isError,
//     create,
//     update,
//     remove,
//   };
// }

// // Fetch a single tournament by id — useful for the review step / detail screen.
// export function useTournament(id: number | undefined) {
//   const repository = useTournamentRepository();

//   return useQuery({
//     queryKey: ["tournaments", id],
//     queryFn: () => {
//       if (id === undefined) {
//         throw new Error("Tournament id is required");
//       }
//       return repository.getById(id);
//     },
//     enabled: id !== undefined,
//   });
// }
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { useTournamentRepository } from "../../../database/hooks/useTournamentRepository";
import { CreateTournament } from "../../../database/repositories/TournamentRepository";

export function useTournaments() {
  const repository = useTournamentRepository();
  const queryClient = useQueryClient();

  const { data: tournaments = [], isLoading, isError } = useQuery({
    queryKey: ["tournaments"],
    queryFn: () => repository.getAll(),
  });

  const { mutateAsync: create } = useMutation({
    mutationFn: (data: CreateTournament) => repository.create(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["tournaments"] });
    },
  });

  const { mutateAsync: update } = useMutation({
    mutationFn: ({ id, data }: { id: number; data: CreateTournament }) =>
      repository.update(id, data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["tournaments"] });
    },
  });

  const { mutateAsync: remove } = useMutation({
    mutationFn: (id: number) => repository.delete(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["tournaments"] });
    },
  });

  const { mutateAsync: generateBracket } = useMutation({
    mutationFn: (id: number) => repository.generateBracket(id),
    onSuccess: async (_result, id) => {
      await queryClient.invalidateQueries({ queryKey: ["tournaments"] });
      await queryClient.invalidateQueries({ queryKey: ["bracket", id] });
    },
  });

  const { mutateAsync: updateTournamentStatus } = useMutation({
    mutationFn: ({ tournamentId, status }: { tournamentId: number; status: string }) =>
      repository.updateTournamentStatus(tournamentId, status as any),
    onSuccess: async (_result, { tournamentId }) => {
      await queryClient.invalidateQueries({ queryKey: ["tournaments"] });
      await queryClient.invalidateQueries({ queryKey: ["tournaments", tournamentId] });
    },
  });

  return {
    tournaments,
    isLoading,
    isError,
    create,
    update,
    remove,
    generateBracket,
  };
}

// Fetch a single tournament by id — useful for the review step / detail screen.
export function useTournament(id: number | undefined) {
  const repository = useTournamentRepository();

  return useQuery({
    queryKey: ["tournaments", id],
    queryFn: () => {
      if (id === undefined) {
        throw new Error("Tournament id is required");
      }
      return repository.getById(id);
    },
    enabled: id !== undefined,
  });
}

// Fetch the generated bracket (rounds + matches) for a tournament.
export function useBracket(id: number | undefined) {
  const repository = useTournamentRepository();

  return useQuery({
    queryKey: ["bracket", id],
    queryFn: () => {
      if (id === undefined) {
        throw new Error("Tournament id is required");
      }
      return repository.getBracket(id);
    },
    enabled: id !== undefined,
  });
}