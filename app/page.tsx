"use client";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { Lightbulb } from "lucide-react";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
const sendMessage = z.object({
  message: z.string().min(3),
});
export default function Home() {
  const [isConnect, setIsConnect] = useState<boolean>(false);
  const [responseServer, setServerResponse] = useState<string[]>([]);
  const socketRef = useRef<Socket | null>(null);
  useEffect(() => {
    socketRef.current = io(process.env.NEXT_PUBLIC_NESTJS);
    const socket = socketRef.current;
    socket.on("connect", () => {
      setIsConnect(true);
    });

    socket.on("message", (msg: string) => {
      setServerResponse((prev) => [...prev, msg]);
    });
    return () => {
      socket.off("connect");
      socket.off("message");
    };
  }, []);
  const form = useForm({
    resolver: zodResolver(sendMessage),
    defaultValues: {
      message: "",
    },
  });
  const socket = socketRef.current;
  const onSubmit = (msg: z.infer<typeof sendMessage>) => {
    if (socket && msg.message.trim()) {
      socket.emit("message", msg);
    }
  };
  return (
    <div className="flex flex-col gap-4 p-8 m-auto w-1/2 h-1/2">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="grid grid-cols-1 gap-4 m-auto border-2 rounded-2xl w-full p-4"
        >
          <div className="w-full bg-slate-300 flex gap-3 text-center justify-center items-center rounded-t-2xl p-4">
            <span className="font-semibold">
              {isConnect ? "Conectado" : "Desconectado"}
            </span>
            <Lightbulb
              className={`w-5 h-5 ${
                isConnect ? "text-green-500 fill-green-500" : "text-red-500"
              }`}
            />
          </div>
          <div className="overflow-auto h-50">
            {responseServer.map((responseServer) => (
              <div className="mt-4 p-4 bg-gray-800 text-white rounded-lg">
                <strong className="block mb-2">Respuesta del servidor:</strong>
                <p className="text-gray-200">{responseServer}</p>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <FormField
              name="message"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg font-medium">
                    Enviar al Socket del Servidor
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="Escribe tu mensaje aquí..."
                      className="w-full"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className="text-gray-600 text-left">
                    Esta información será enviada al WebSocket de NestJS, Al
                    Refrescar se desconecta y se refresca nuevamente la conexion
                  </FormDescription>
                  {form.formState.errors.message && (
                    <p className="text-red-500 text-sm">
                      {form.formState.errors.message.message}
                    </p>
                  )}
                </FormItem>
              )}
            />
            <div className="flex flex-row gap-1.5 justify-between w-full">
              <Button
                type="submit"
                disabled={!isConnect || form.formState.isSubmitting}
                className="grow"
              >
                {form.formState.isSubmitting ? "Enviando..." : "Enviar Mensaje"}
              </Button>
              <Button
                type="button"
                onClick={() => {
                  setServerResponse([]);
                }}
                className="grow"
                variant={"secondary"}
              >
                {" "}
                Limpiar Mensajes
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
