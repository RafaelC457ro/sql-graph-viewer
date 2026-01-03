import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { useConnection, useUpdateConnection } from "@/hooks/useConnection";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

const formSchema = z.object({
  host: z.string().min(1, "Host is required"),
  port: z.string().min(1, "Port is required"),
  database: z.string().min(1, "Database is required"),
  user: z.string().min(1, "User is required"),
  password: z.string(),
  graph: z.string().min(1, "Graph name is required"),
  name: z.string().min(1, "Server name is required"),
  category: z.enum(["production", "development"]),
});

type FormValues = z.infer<typeof formSchema>;

interface ConnectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: FormValues | null;
  connectionId?: string | null;
}

export function ConnectionDialog({ open, onOpenChange, initialData, connectionId }: ConnectionDialogProps) {
  const { connect } = useConnection();
  const updateConnection = useUpdateConnection();
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      host: "localhost",
      port: "5432",
      database: "postgres",
      user: "postgres",
      password: "",
      graph: "age_graph",
      name: "Local PostgreSQL",
      category: "development",
    },
  });

  useEffect(() => {
    if (open) {
      if (initialData) {
        form.reset(initialData);
      } else {
        form.reset({
          host: "localhost",
          port: "5432",
          database: "postgres",
          user: "postgres",
          password: "",
          graph: "age_graph",
          name: "Local PostgreSQL",
          category: "development",
        });
      }
    }
  }, [open, initialData, form]);

  function onSubmit(values: FormValues) {
    setError(null);
    if (connectionId && initialData) {
      const { name, category, ...config } = values;
      updateConnection.mutate({ 
        id: connectionId, 
        params: { 
          name, 
          category, 
          connectionConfig: config 
        } 
      }, {
        onSuccess: () => {
          onOpenChange(false);
          form.reset();
        },
        onError: (err: any) => {
          setError(err instanceof Error ? err.message : "An error occurred");
        },
      });
    } else {
      connect.mutate(values, {
        onSuccess: () => {
          onOpenChange(false);
          form.reset();
        },
        onError: (err: any) => {
          setError(err instanceof Error ? err.message : "An error occurred");
        },
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden gap-0">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle>{connectionId ? "Edit Connection" : "Connect to Database"}</DialogTitle>
          <DialogDescription>
            Enter your PostgreSQL + Apache AGE connection details.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[80vh] px-6 pb-6">
          <div className="pt-2">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Server Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Local PostgreSQL" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Environment Category</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select environment" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="development">Development</SelectItem>
                          <SelectItem value="production">Production</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="host"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Host</FormLabel>
                      <FormControl>
                        <Input placeholder="localhost" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="port"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Port</FormLabel>
                        <FormControl>
                          <Input placeholder="5432" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="database"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Database</FormLabel>
                        <FormControl>
                          <Input placeholder="postgres" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="graph"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Graph Name</FormLabel>
                      <FormControl>
                        <Input placeholder="age_graph" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="user"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>User</FormLabel>
                      <FormControl>
                        <Input placeholder="postgres" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {error && (
                  <div className="text-sm font-medium text-destructive">
                    {error}
                  </div>
                )}
                <Button type="submit" className="w-full" disabled={connect.isPending || updateConnection.isPending}>
                  {connectionId ? (updateConnection.isPending ? "Saving..." : "Save Changes") : (connect.isPending ? "Connecting..." : "Connect")}
                </Button>
              </form>
            </Form>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
