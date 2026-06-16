import z from "zod";

const dateTimeSchema = z.iso.datetime({precision : -1});